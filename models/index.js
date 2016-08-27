"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const config = require(path.join(__dirname, "..", "config"));

let database = new Sequelize(config.database, config.username, config.password, config);
let models = {};

// Find and load models.
fs.readdirSync(__dirname).forEach(function(file) {
	// Ignore hidden files and this file.
	if((file.charAt(0) == ".") || (file == "index.js")) {
		return;
	}

	// Load the model.
	let model = database.import(path.join(__dirname, file));
	models[model.name] = model;
});

// Apply model relations.
Object.keys(models).forEach(function(name) {
	if("associate" in models[name] === true) {
		models[name].associate(models);
	}
});

// Sync models with the database.
database.sync({
	force: true,
});

module.exports = models;
