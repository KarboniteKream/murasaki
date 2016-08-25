// TODO: "use strict";
// TODO: const, var or let?
var Sequelize = require("sequelize"),
	request = require("request"),
	FeedParser = require("feedparser"),
	config = require("./config");

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
	name: {
		type: Sequelize.STRING(255),
	},
	// TODO: Rename to link? Should this be the link to the feed or the website?
	url: {
		type: Sequelize.STRING(1024),
	},
	// TODO: Description, icon, last updated.
});

var Post = db.define("posts", {
	feed_id: {
		type: Sequelize.INTEGER(11),
	},
	title: {
		type: Sequelize.STRING(255),
	},
	// TODO: Rename to link?
	url: {
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

var feed = {
	meta: null,
	posts: [],
};

if(url.startsWith("http") === false) {
	// TODO: HTTPS?
	url = "http://" + url;
}

var req = request(url);
var feedparser = new FeedParser({
	addmeta: false,
});

req.on("error", error);
req.on("response", response);

feedparser.on("error", error);
feedparser.on("meta", meta);
feedparser.on("readable", readable);
feedparser.on("end", end);

function error(err) {
	console.log(err);
}

function response(res) {
	var stream = this;

	if(res.statusCode != 200) {
		return this.emit("error", new Error("Bad status code."));
	}

	stream.pipe(feedparser);
}

function meta(meta) {
	feed.meta = {
		title: meta.title,
		description: meta.description,
		link: meta.link,
		date: meta.date, // Latest update?
		pubdate: meta.pubdate,
		favicon: meta.favicon, // Atom only.
	};
}

function readable() {
	var item;

	while((item = this.read()) !== null) {
		feed.posts.push({
			guid: item.guid,
			title: item.title,
			summary: item.summary,
			description: item.description,
			pubdate: item.pubdate,
			date: item.date,
			link: item.link,
			author: item.author,
		});
	}
}

function end() {
	// TODO: If feed.meta.favicon == null.
	var icon = request("https://www.google.com/s2/favicons?domain=" + feed.meta.link);

	Feed.create({
		title: feed.meta.title,
		url: feed.meta.link, // TODO: feed.meta.xmlUrl?
	}).then(function(result) {
		// TODO: created_at and updated_at are converted to UTC on save, but not on get.
		var feed_id = result.id;

		// TODO: When adding, check if the link already exists. Maybe GUID?
		for(var i = 0; i < feed.posts.length; i++) {
			var post = feed.posts[i];

			Post.create({
				feed_id: feed_id,
				title: post.title,
				url: post.link,
				author: post.author,
				date: post.pubdate, // Already in UTC.
				content: post.description, // TODO: Summary?
			});
		}
	});
}
