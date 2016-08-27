"use strict";

const Request = require("request");
const Feedparser = require("feedparser");
const Log = require("./log");
const models = require("./models");

let url = "https://blog.rust-lang.org/feed.xml";

let data = {
	feed: null,
	posts: [],
	error: false,
};

if(url.startsWith("http") === false) {
	// TODO: HTTPS?
	url = "http://" + url;
}

let feedparser = new Feedparser({
	addmeta: false,
});

// Get the feed and pipe it to Feedparser.
Request.get(url).on("response", function(response) {
	let stream = this;

	if(response.statusCode != 200) {
		Log.error("Request", "Error: Unable to retrieve the feed (HTTP " + response.statusCode + ").");
		return;
	}

	stream.pipe(feedparser);
});

// An error occurred while parsing the feed.
feedparser.on("error", function(err) {
	Log.error("Feedparser", err + ".");
	data.error = true;
});

// Get feed metadata.
feedparser.on("meta", function(meta) {
	data.feed = {
		title: meta.title,
		description: meta.description,
		website: meta.link,
		link: meta.xmlurl,
		icon: null, // Only available in Atom feeds.
		last_updated: meta.date,
	};
});

// Get feed posts.
feedparser.on("readable", function() {
	let post = null;

	while((post = this.read()) !== null) {
		data.posts.push({
			title: post.title,
			link: post.link,
			author: post.author,
			date: post.pubdate, // Already in UTC.
			content: post.description,
		});
	}
});

// Save the feed and its posts.
feedparser.on("end", function() {
	if(data.error === true) {
		return;
	}

	// Get the favicon.
	Request.get({
		url: "https://www.google.com/s2/favicons?domain=" + data.feed.website,
		encoding: null,
	}, function(err, res, body) {
		// TODO: Handle error.
		if(err !== null && res.statusCode == 200) {
			data.feed.icon = body;
		}

		// TODO: Error handling.
		// TODO: If data.feed.link exists, update instead.
		models.Feed.create(data.feed).then(function(feed) {
			// TODO: created_at and updated_at are converted to UTC on save, but not on get.
			// TODO: Sort articles by date. They could be unordered and also there will be order in the database.
			// TODO: When adding, check if the link already exists.
			for(let i = 0; i < data.posts.length; i++) {
				data.posts[i].feed_id = feed.id;
				models.Post.create(data.posts[i]);
			}
		});
	});
});
