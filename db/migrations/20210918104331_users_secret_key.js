exports.up = function (knex, Promise) {
  return knex.schema.table("users", function (table) {
    table.string("secret_code");
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.table("users", function (table) {
    table.dropColumn("secret_code");
  });
};
