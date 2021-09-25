exports.up = function (knex, Promise) {
  return knex.schema.table("users", function (table) {
    table.string("last_buddy_notification").defaultTo("0");
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.table("users", function (table) {
    table.dropColumn("last_buddy_notification");
  });
};
