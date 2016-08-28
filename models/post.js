"use strict";

let Bookshelf = require("../database.js");
require("./feed");

module.exports = Bookshelf.model("Post", {
	tableName: "Post",
	hasTimestamps: true,

	feed: function() {
		return this.belongsTo("Feed");
	},
});
