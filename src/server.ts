require("dotenv").config();
import express from "express";
import schema from "./schema";
import checkAuth from "./auth";
import { avatar } from './utilities';
import jwt from "jsonwebtoken";
import graphqlHTTP from "express-graphql";
import bodyParser from "body-parser";
import bcrypt from "bcrypt"
import cron from 'node-cron';

const knex = require('../db/knex.js');

const app = express();
const jsonParser = bodyParser.json();

app.use(
  "/graphql",
  graphqlHTTP(async req => {
    const authData = await checkAuth(req);
    // const authData = { user: null };
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
    const user = await knex.insert({ username: username.toLowerCase(), email: email.toLowerCase(), user_avatar: avatar(), password: hash }).table('users').returning('*')
    const create_bookmark = await knex.insert({ user_id: user[0].id, }).table('bookmarks').returning('*')

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
      error: 'A server side error occurred'
    }

    const response = JSON.stringify(data)
    res.send(response)
  }

});

app.post("/login", jsonParser, async function (req, res) {
  try {
    const { email, pw } = req.body;
    /* So what's our call with Login endpoint?
    Absort credentials and check
    a) Does this email not exist? if it doesn't throw error that they should sign up
    b) email does, exist, however the password is incorrect...let's do it!
    */
    const users = await knex.select().table("users").where({ email: email.toLowerCase() });
    if (!users.length) {
      const data = {
        status: 'error',
        error: 'This email address has not been used for registration. Please try signing up or using a different email address.'
      }
      const response = JSON.stringify(data)
      res.send(response)
      return
    }

    if (bcrypt.compareSync(pw, users[0].password)) {
      // Passwords match
      const payload = { user: users[0].id, username: users[0].username };
      const options = { expiresIn: '120d', issuer: 'Dendro Services' };
      const secret = process.env.JWT_SECRET;
      const token = jwt.sign(payload, secret, options);
      const data = {
        status: 'success',
        token: token
      }
      const response = JSON.stringify(data)
      res.send(response)
    } else {
      // Passwords don't match
      const data = {
        status: 'error',
        error: 'This is an incorrect password'
      }
      const response = JSON.stringify(data)
      res.send(response)
    }

  } catch (error) {
    console.log(error)
    const data = {
      status: 'error',
      error: 'A server side error occurred'
    }
    const response = JSON.stringify(data)
    res.send(response)
  }

});

const server = app.listen(process.env.PORT, () => {
  console.log(`Listening on http server ${process.env.PORT}.`);
});


// Crons

// my_threads
cron.schedule('*/3 * * * *', async () => {
  // Get me a list of unique users that have commented anywhere on the platform.
  const list = await knex.raw('SELECT DISTINCT user_id from comments')
  // LOOPING THROUGH EACH UNIQUE USER WHO HAS COMMENTED //
  for (const item of list.rows) {
    // Get my unique posts (again we are only getting comment ids not the full object)
    const a = await knex.raw(`SELECT id, thread_id from comments where user_id = ${item.user_id}`)
    let array: any = []

    a.rows.forEach(element => {
      if (!element.thread_id) {
        array.push(element.id)
        return
      }
      array.push(element.thread_id)
    });

    const uniq = [...new Set(array)]
    const stringified = JSON.stringify(uniq)
    const update = await knex.update({ my_threads: stringified }).table('users').where({ id: item.user_id })

  }

})
