"use strict";

let chalk = require("chalk");

module.exports.success = function(tag, message) {
	if(tag === null) {
		console.log(chalk.green(message));
	} else {
		console.log(chalk.green("[" + tag + "] " + message));
	}
};

module.exports.warn = function(tag, message) {
	if(tag === null) {
		console.warn(chalk.yellow(message));
	} else {
		console.warn(chalk.yellow("[" + tag + "] " + message));
	}
};

module.exports.error = function(tag, message) {
	if(tag === null) {
		console.error(chalk.red(message));
	} else {
		console.error(chalk.red("[" + tag + "] " + message));
	}
};
