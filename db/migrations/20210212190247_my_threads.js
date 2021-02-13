exports.up = function (knex, Promise) {
    return knex.schema.table("users", function (table) {
        table.text('my_threads');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table("users", function (table) {
        table.dropColumn('my_threads');
    });
};



