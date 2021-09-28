exports.up = function (knex, Promise) {
  return knex.schema.createTable("referrals", function (table) {
    table.increments("id");
    table.integer("user_id");
    table.integer("referred");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable("referrals");
};
