/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable("newsarticle", (table) => {
        table.increments("id").primary();
        table.string("title").notNullable();
        table.string("author").notNullable();
        table.string("source").notNullable();
        table.string("description").notNullable();
        table.string("url").notNullable();
        table.string("url_to_image").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table
            .timestamp("updated_at")
            .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable("newsarticle");
};
