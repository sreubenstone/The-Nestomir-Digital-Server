// This is knex.js configuration file (https://knexjs.org/) – the knex library helps us speak to our database (postgres)

require("dotenv").config();

const settings = {
  development: {
    client: "pg",
    connection: process.env.PGCONNECTSTRING,
    migrations: {
      directory: "./db/migrations",
    },
    seeds: {
      directory: "./db/seeds/dev",
    },
    useNullAsDefault: true,
  },

  production: {
    client: "pg",
    connection: process.env.PGCONNECTSTRING,
    ssl: {
      rejectUnauthorized: false,
    },
    migrations: {
      directory: "./db/migrations",
    },
    seeds: {
      directory: "./db/seeds/dev",
    },
    useNullAsDefault: true,
  },
};

module.exports = settings;
