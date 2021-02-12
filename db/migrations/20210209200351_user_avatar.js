exports.up = function (knex, Promise) {
    return knex.schema.table("users", function (table) {
        table.string('user_avatar');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table("users", function (table) {
        table.dropColumn('user_avatar');
    });
};