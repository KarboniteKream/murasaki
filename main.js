"use strict";

const Request = require("request");
const Feedparser = require("feedparser");
const Log = require("./log");

const Feed = require("./models/feed");
const Post = require("./models/post");

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
			date: post.pubdate, // TODO: Convert to UTC.
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
		if(err === null && res.statusCode == 200) {
			data.feed.icon = body;
		}

		// TODO: Error handling.
		// TODO: If data.feed.link exists, update instead.
		new Feed(data.feed).save().then(function(feed) {
			// TODO: Convert to UTC.
			// TODO: When adding, check if the link already exists?

			for(let i = 0; i < data.posts.length; i++) {
				data.posts[i].feed_id = feed.id;
				new Post(data.posts[i]).save();
			}
		});
	});
});
