/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable("user_preference", (table) => {
        table.increments("id").primary();
        table.integer("user_id").unsigned().notNullable();
        table.integer("preference_id").unsigned().notNullable();
        table
            .foreign("user_id")
            .references("id")
            .inTable("user")
            .onUpdate("CASCADE")
            .onDelete("CASCADE")
        table
            .foreign("preference_id")
            .references("id")
            .inTable("preference")
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
    return knex.schema.dropTable("user_preference");
};
