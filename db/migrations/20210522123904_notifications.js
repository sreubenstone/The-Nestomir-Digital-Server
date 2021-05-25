exports.up = function (knex, Promise) {
  return knex.schema.createTable("notifications", function (table) {
    table.increments("id");
    table.integer("user_id");
    table.boolean("read").defaultTo(false);
    table.string("body");
    table.integer("thread_id");
    table.string("thread_title");
    table.string("notification_image");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable("notifications");
};
