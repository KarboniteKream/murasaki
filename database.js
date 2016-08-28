"use strict";

const env = process.env.NODE_ENV || "production";
const Knex = require("knex")(require("./knexfile.js")[env]);
const Bookshelf = require("bookshelf")(Knex);

Bookshelf.plugin("registry");

module.exports = Bookshelf;
