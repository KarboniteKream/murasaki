"use strict";

let Bookshelf = require("../database.js");
require("./post");

module.exports = Bookshelf.model("Feed", {
	tableName: "Feed",
	hasTimestamps: true,

	posts: function() {
		return this.hasMany("Feed");
	},

	parse: function(attributes) {
		if("icon" in attributes === true) {
			attributes.icon = attributes.icon.toString("base64");
		}

		return attributes;
	},
});
