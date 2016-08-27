"use strict";

module.exports = function(database, Sequelize) {
	let Feed = database.define("Feed", {
		id: {
			type: Sequelize.INTEGER(11),
			primaryKey: true,
			autoIncrement: true,
		},
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
			// allow_null: true,
		},
		last_updated: {
			type: Sequelize.DATE,
		},
	}, {
		classMethods: {
			associate: function(models) {
				Feed.hasMany(models.Post);
			},
		},
	});

	return Feed;
};
