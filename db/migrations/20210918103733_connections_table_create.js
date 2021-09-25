exports.up = function (knex, Promise) {
  return knex.schema.createTable("connections", function (table) {
    table.increments("id");
    table.integer("user_a");
    table.integer("user_b");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable("connections");
};
