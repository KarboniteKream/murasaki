exports.up = function(knex, Promise) {
	return knex.schema.createTable("Feed", function(table) {
		table.charset("utf8mb4");
		table.collate("utf8mb4_unicode_ci");

		table.increments("id").unsigned().primary();
		table.string("title", 127).notNullable();
		table.string("description", 255);
		table.string("website", 511).collate("ascii_general_ci");
		table.string("link", 1023).unique().notNullable().collate("ascii_general_ci");
		table.binary("icon");
		table.datetime("last_updated");
		table.timestamps();
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable("Feed");
};
