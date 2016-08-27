"use strict";

module.exports = function(database, Sequelize) {
	let Post = database.define("Post", {
		id: {
			type: Sequelize.INTEGER(11),
			primaryKey: true,
			autoIncrement: true,
		},
		feed_id: {
			type: Sequelize.INTEGER(11),
		},
		title: {
			type: Sequelize.STRING(255),
			allowNull: false,
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
	}, {
		classMethods: {
			associate: function(models) {
				Post.belongsTo(models.Feed, {
					onDelete: "CASCADE",
				});
			},
		},
	});

	return Post;
};
