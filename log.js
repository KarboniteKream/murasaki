"use strict";

const chalk = require("chalk");
const moment = require("moment");

function write(color, tag, message) {
	if(tag !== null) {
		message = "[" + tag + "] " + message;
	}

	console.log(color(moment().format("YYYY-MM-DD HH:mm:ss") + " " + message));
}

module.exports.success = function(tag, message) {
	write(chalk.green, tag, message);
};

module.exports.warn = function(tag, message) {
	write(chalk.yellow, tag, message);
};

module.exports.error = function(tag, message) {
	write(chalk.red, tag, message);
};
