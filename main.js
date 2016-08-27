// TODO: "use strict";
// TODO: const, var or let?
var Sequelize = require("sequelize");
var request = require("request");
var FeedParser = require("feedparser");
var chalk = require("chalk");
var config = require("./config");

var db = new Sequelize(config.database, config.username, config.password, {
	host: config.host,
	dialect: "mysql",
	pool: {
		max: 5,
		min: 0,
		idle: 1000,
		handleDisconnects: true,
	},
	define: {
		underscored: true,
	},
	// logging: false,
	// timezone: "+02:00",
});

var Feed = db.define("feeds", {
	title: {
		type: Sequelize.STRING(255),
	},
	description: {
		// TODO: Text?
		type: Sequelize.STRING(1024),
	},
	website: {
		type: Sequelize.STRING(1024),
	},
	link: {
		type: Sequelize.STRING(1024),
	},
	icon: {
		type: Sequelize.BLOB,
	},
	last_updated: {
		type: Sequelize.DATE,
	},
});

var Post = db.define("posts", {
	feed_id: {
		type: Sequelize.INTEGER(11),
	},
	title: {
		type: Sequelize.STRING(255),
	},
	link: {
		type: Sequelize.STRING(1024),
	},
	author: {
		type: Sequelize.STRING(255),
	},
	date: {
		type: Sequelize.DATE,
	},
	content: {
		type: Sequelize.TEXT,
	},
});

// TODO: options.force = true.
db.sync();

var url = "https://blog.rust-lang.org/feed.xml";

var data = {
	feed: null,
	posts: [],
	error: false,
};

if(url.startsWith("http") === false) {
	// TODO: HTTPS?
	url = "http://" + url;
}

var feedparser = new FeedParser({
	addmeta: false,
});

// Get the feed and pipe it to FeedParser.
request.get(url).on("response", function(response) {
	if(response.statusCode != 200) {
		console.error(chalk.red("[Request] Error: Unable to retrieve the feed (HTTP " + response.statusCode + ")."));
		return;
	}

	this.pipe(feedparser);
});

// An error occurred while parsing the feed.
feedparser.on("error", function(err) {
	console.error(chalk.red("[FeedParser] " + err + "."));
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
	var post = null;

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
	request.get({
		url: "https://www.google.com/s2/favicons?domain=" + data.feed.website,
		encoding: null,
	}, function(err, res, body) {
		// TODO: Handle error.
		if(err !== null && res.statusCode == 200) {
			data.feed.icon = body;
		}

		// TODO: Error handling.
		// TODO: If data.feed.link exists, update instead.
		Feed.create(data.feed).then(function(feed) {
			// TODO: created_at and updated_at are converted to UTC on save, but not on get.
			// TODO: Sort articles by date. They could be unordered and also there will be order in the database.
			// TODO: When adding, check if the link already exists.
			for(var i = 0; i < data.posts.length; i++) {
				data.posts[i].feed_id = feed.id;
				Post.create(data.posts[i]);
			}
		});
	});
});
