exports.up = function (knex, Promise) {
  return knex.schema.table("users", function (table) {
    table.boolean("pause_push").defaultTo(false);
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.table("users", function (table) {
    table.dropColumn("pause_push");
  });
};
