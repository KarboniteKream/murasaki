exports.up = function(knex, Promise) {
	return knex.schema.createTable("Post", function(table) {
		table.charset("utf8mb4");
		table.collate("utf8mb4_unicode_ci");

		table.increments("id").unsigned().primary();
		table.integer("feed_id").unsigned().notNullable().references("Feed.id").onDelete("CASCADE");
		table.string("title", 255).notNullable();
		table.string("link", 1023).collate("ascii_general_ci");
		table.string("author", 127);
		table.datetime("date").notNullable();
		table.text("content");
		table.timestamps();
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable("Post");
};
