exports.up = function (knex, Promise) {
  return knex.schema.table("bookmarks", function (table) {
    table.float("percentage");
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.table("bookmarks", function (table) {
    table.dropColumn("percentage");
  });
};
