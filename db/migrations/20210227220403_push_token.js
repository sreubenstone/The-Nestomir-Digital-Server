exports.up = function (knex, Promise) {
    return knex.schema.table("users", function (table) {
        table.string('push_token');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table("users", function (table) {
        table.dropColumn('push_token');
    });
};
