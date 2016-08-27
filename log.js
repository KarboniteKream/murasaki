"use strict";

var chalk = require("chalk");

module.exports.warn = function(tag, message) {
	if(tag === null) {
		console.warn(chalk.yellow(message));
	} else {
		console.warn(chalk.yellow("[" + tag + "] " + message));
	}
}

module.exports.error = function(tag, message) {
	if(tag === null) {
		console.error(chalk.red(message));
	} else {
		console.error(chalk.red("[" + tag + "] " + message));
	}
};
