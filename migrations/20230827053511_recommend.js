/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable("recommend", (table) => {
        table.increments("id").primary();
        table.integer("user_id").unsigned().notNullable();
        table.integer("newsarticle_id").unsigned().notNullable();
        table
            .foreign("user_id")
            .references("id")
            .inTable("user")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
        table
            .foreign("newsarticle_id")
            .references("id")
            .inTable("newsarticle")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
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
    return knex.schema.dropTable("recommend");
};
