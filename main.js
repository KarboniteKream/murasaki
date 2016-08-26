// TODO: "use strict";
// TODO: const, var or let?
var Sequelize = require("sequelize");
var request = require("request");
var FeedParser = require("feedparser");
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

var feed = {
	meta: null,
	posts: [],
};

if(url.startsWith("http") === false) {
	// TODO: HTTPS?
	url = "http://" + url;
}

// Get the feed and pipe it to FeedParser.
request(url).on("error", function(err) {
	console.log("Unable to get the feed: ", err);
}).on("response", function(response) {
	// TODO: Test behaviour.
	if(response.statusCode != 200) {
		return this.emit("error", new Error("Bad status code."));
	}

	this.pipe(feedparser);
});

var feedparser = new FeedParser({
	addmeta: false,
});

// An error occurred while parsing the feed.
feedparser.on("error", function(err) {
	console.log("Unable to parse the feed: ", err);
});

// Get feed metadata.
feedparser.on("meta", function(meta) {
	feed.meta = {
		title: meta.title,
		description: meta.description,
		website: meta.link,
		link: meta.xmlurl,
		// TODO: Icon.
		icon: null,
		last_updated: meta.date, // Latest update.
	};
});

// Get feed posts.
feedparser.on("readable", function() {
	var item;

	while((item = this.read()) !== null) {
		feed.posts.push({
			title: item.title,
			link: item.link,
			description: item.description,
			pubdate: item.pubdate,
			date: item.date,
			author: item.author,
		});
	}
});

// Save the feed and its posts.
feedparser.on("end", function() {
	// Get the favicon.
	request("https://www.google.com/s2/favicons?domain=" + feed.meta.website, function(err, res, body) {
		if(err !== null) {
			// TODO
		}

		if(res.statusCode == 200) {
			feed.meta.icon = body;
		}

		Feed.create(feed.meta).then(function(result) {
			// TODO: created_at and updated_at are converted to UTC on save, but not on get.
			var feed_id = result.id;

			// TODO: Sort articles by date. They could be unordered and also there will be order in the database.
			// TODO: When adding, check if the link already exists.
			for(var i = 0; i < feed.posts.length; i++) {
				var post = feed.posts[i];

				Post.create({
					feed_id: feed_id,
					title: post.title,
					link: post.link,
					author: post.author,
					date: post.pubdate, // Already in UTC.
					content: post.description, // TODO: Summary?
				});
			}
		});
	});
});
