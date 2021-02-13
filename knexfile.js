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
};

module.exports = settings