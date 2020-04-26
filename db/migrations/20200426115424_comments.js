exports.up = function (knex, Promise) {
    return knex.schema.createTable("comments", function (table) {
        table.increments("id");
        table.integer("user_id");
        table.integer("thread_id");
        table.boolean("is_post");
        table.string("title");
        table.text("body");
        table.integer("rel_chapter");
        table.string("audio");
        table.timestamp("thread_updated").defaultTo(knex.fn.now());
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable("comments");
};