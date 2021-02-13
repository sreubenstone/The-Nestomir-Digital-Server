// Update with your config settings.
require("dotenv").config();

const settings = {
  development: {
    client: "pg",
    connection: process.env.PGCONNECTSTRING,
    migrations: {
      directory: "./db/migrations"
    },
    seeds: {
      directory: "./db/seeds/dev"
    },
    useNullAsDefault: true
  },

  production: {
    client: "postgresql",
    connection: process.env.PGCONNECTSTRING,
    migrations: {
      directory: "./db/migrations"
    },
    pool: {
      min: 2,
      max: 10
    },
    // migrations: {
    //   tableName: "knex_migrations"
    // }
  }
};

module.exports = settings