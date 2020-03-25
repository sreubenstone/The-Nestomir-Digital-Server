require("dotenv").config();
import express from "express";
import schema from "./schema";
import jwt from "jsonwebtoken";
import graphqlHTTP from "express-graphql";
import bodyParser from "body-parser";
import knexlib from "knex";
import bcrypt from "bcrypt"
import { development } from "../knexfile"
const knex = knexlib(development);


import auth from "./auth";

const app = express();

const jsonParser = bodyParser.json();

app.use(
  "/graphql",
  graphqlHTTP(async req => {
    // const authData = auth(req);
    const authData = { user: null };
    return {
      schema,
      context: authData,
      graphiql: true
    };
  })
);

app.post("/signup", jsonParser, async function (req, res) {
  try {
    const { username, email, pw } = req.body;
    /*
    -  (1) Does this email exist already? (must set everything to lower case)
    - (2) Does this user name exist already? (must set everything to lower case)
    */
    const email_check = await knex.select().table("users").where({ email: email.toLowerCase() });
    const username_check = await knex.select().table("users").where({ username: username.toLowerCase() });

    if (email_check.length) {
      const data = {
        status: 'error',
        error: 'This email already exists in our system. Please try logging in.'
      }
      const response = JSON.stringify(data)
      res.send(response)
      return
    }

    if (username_check.length) {
      const data = {
        status: 'error',
        error: 'This username already exists. Please change your username'
      }
      const response = JSON.stringify(data)
      res.send(response)
      return
    }

    // Salt PW, Create User in Database
    const hash = bcrypt.hashSync(pw, 12);
    const user = await knex.insert({ username: username.toLowerCase(), email: email.toLowerCase(), password: hash }).table('users').returning('*')

    // ~PASSES ALL CHECKS~

    // JWT ISSUING
    const payload = { user: user[0].id, username: user[0].username, };
    const options = { expiresIn: '120d', issuer: 'Dendro Services' };
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret, options);
    const data = {
      status: 'success',
      token: token
    }
    const response = JSON.stringify(data)
    res.send(response)

  } catch (error) {

    console.log(error)
    const data = {
      status: 'error',
      error: 'A server side network error occurred'
    }

    const response = JSON.stringify(data)
    res.send(response)
  }

});

const server = app.listen(process.env.PORT, () => {
  console.log(`Listening on http server ${process.env.PORT}.`);
});
