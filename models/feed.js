"use strict";

let Bookshelf = require("../database.js");
require("./post");

module.exports = Bookshelf.model("Feed", {
	tableName: "Feed",
	hasTimestamps: true,

	posts: function() {
		return this.hasMany("Feed");
	},
});
