require("dotenv").config();
import express from "express";
import schema from "./schema";
import checkAuth from "./auth";
import { avatar, getBuddies, sendWelcomeEmail, sendReferralEmail } from "./utilities";
import jwt from "jsonwebtoken";
import graphqlHTTP from "express-graphql";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import cron from "node-cron";
import { push } from "./push";
import { lookup } from "dns";
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const Mixpanel = require("mixpanel");
const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
const knex = require("../db/knex.js");
const app = express();
const jsonParser = bodyParser.json();

if (process.env.PROD === "true") {
  Sentry.init({
    dsn: "https://34f09192d1bf4cc1ab4689b5edc502cd@o361938.ingest.sentry.io/5945718",
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

app.use(
  "/graphql",
  graphqlHTTP(async (req) => {
    const authData = await checkAuth(req);
    // const authData = { user: null };
    return {
      schema,
      context: authData,
      graphiql: process.env.PROD === "false" ? true : false,
    };
  })
);

//////////////////////////////////////////// REST ENDPOINTS ////////////////////////////////////////////
app.post("/signup", jsonParser, async function (req, res) {
  try {
    const { username, email, pw, reader_code } = req.body;
    /*
    -  (1) Does this email exist already? (must set everything to lower case)
    - (2) Does this user name exist already? (must set everything to lower case)
    */
    const email_check = await knex.select().table("users").where({ email: email.toLowerCase() });
    const username_check = await knex.select().table("users").where({ username: username.toLowerCase() });

    if (email_check.length) {
      const data = {
        status: "error",
        error: "This email already exists in our system. Please try logging in.",
      };
      const response = JSON.stringify(data);
      res.send(response);
      return;
    }

    if (username_check.length) {
      const data = {
        status: "error",
        error: "This username already exists. Please change your username",
      };
      const response = JSON.stringify(data);
      res.send(response);
      return;
    }

    // Must establish these variables so we can make connection record below
    let added_existing_referrer = false;
    let existing_referrer_id = null;

    /////////////// PROCESSING REFERRING USER FROM SIGN UP FORM ///////////////
    // CASE 1 - Does the reader code exist? If not, return an error - THEN RETURN
    if (reader_code.length > 0) {
      // A READER REFERRAL CODE WAS SUBMITTED BY USER
      const look_up = await knex.select().table("users").where({ secret_code: reader_code });
      if (!look_up.length) {
        const data = {
          status: "error",
          error: "This secret reader code does not exist.",
        };
        const response = JSON.stringify(data);
        res.send(response);
        return;
      }
      // READER CODE DOES EXIST
      added_existing_referrer = true;
      existing_referrer_id = look_up[0].id;
    }

    ///////////// PASSES ALL CHECKS /////////////

    // Salt PW, Create User in Database
    const hash = bcrypt.hashSync(pw, 12);
    const user = await knex.insert({ username: username.toLowerCase(), email: email.toLowerCase(), user_avatar: avatar(), password: hash }).table("users").returning("*");

    // If the reader code exists -> add the connection between the users.
    if (added_existing_referrer) {
      const create_connection = await knex.insert({ user_a: user[0].id, user_b: existing_referrer_id }).table("connections").returning("*");
      const add_referral_record = await knex.insert({ user_id: existing_referrer_id, referred: user[0].id }).table("referrals").returning("*");
      // send email to user
      if (process.env.PROD === "true") {
        sendReferralEmail(add_referral_record[0].id);
      }
    }
    const create_bookmark = await knex.insert({ user_id: user[0].id }).table("bookmarks").returning("*");

    // GENERATE SECRET READER CODE //
    let passed = false;

    while (!passed) {
      let result = "";
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      // Is there a conflict in the db with an exisitng user?
      const check = await knex.select().table("users").where({ secret_code: result });
      if (!check.length) {
        const save_code = await knex.update({ secret_code: result }).table("users").where({ id: user[0].id }).returning("*");
        passed = true;
      }
    }

    // Send user to MixPanel
    if (process.env.PROD === "true") {
      mixpanel.people.set(user[0].id, {
        $email: user[0].email,
        username: user[0].username,
      });
    }

    // JWT ISSUING
    const payload = { user: user[0].id, username: user[0].username };
    const options = { expiresIn: "180d", issuer: "Dendro Services" };
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret, options);
    const data = {
      status: "success",
      token: token,
    };
    const response = JSON.stringify(data);
    res.send(response);
    // succesful sign up happpened so send welcome email
    if (process.env.PROD === "true") {
      sendWelcomeEmail(user[0].email, user[0].username);
    }
  } catch (error) {
    console.log(error);
    const data = {
      status: "error",
      error: "A server side error occurred",
    };

    const response = JSON.stringify(data);
    res.send(response);
  }
});

///////////////////////////// LOGIN ENDPOINT ///////////////////////////////////////////////////////////

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
        status: "error",
        error: "This email address has not been used for registration. Please try signing up or using a different email address.",
      };
      const response = JSON.stringify(data);
      res.send(response);
      return;
    }

    if (bcrypt.compareSync(pw, users[0].password)) {
      // Passwords match
      const payload = { user: users[0].id, username: users[0].username };
      const options = { expiresIn: "120d", issuer: "Dendro Services" };
      const secret = process.env.JWT_SECRET;
      const token = jwt.sign(payload, secret, options);
      const data = {
        status: "success",
        token: token,
      };
      const response = JSON.stringify(data);
      res.send(response);
    } else {
      // Passwords don't match
      const data = {
        status: "error",
        error: "This is an incorrect password. Forgot your password? Please email stevenreubenstone@gmail.com. Support will respond within 3 minutes.",
      };
      const response = JSON.stringify(data);
      res.send(response);
    }
  } catch (error) {
    console.log(error);
    const data = {
      status: "error",
      error: "A server side error occurred",
    };
    const response = JSON.stringify(data);
    res.send(response);
  }
});

///////////////////////////// BUDDY ENDPOINT ///////////////////////////////////////////////////////////

app.post("/buddy", jsonParser, async function (req, res) {
  try {
    const { user_id, chapter_opened } = req.body;
    const me_the_user = await knex.select().table("users").where({ id: user_id });
    const buddies: any = await getBuddies(user_id);
    if (!buddies) {
      return;
    }
    const now = Date.now();
    const chapters: any = [
      "Prologue",
      "Chapter 1",
      "Chapter 2",
      "Chapter 3",
      "Chapter 4",
      "Chapter 5",
      "Chapter 6",
      "Chapter 7",
      "Chapter 8",
      "Chapter 9",
      "Chapter 10",
      "Chapter 11",
      "Chapter 12",
      "Chapter 13",
      "Chapter 14",
      "Chapter 15",
      "Chapter 16",
    ];

    buddies.forEach(async (buddy) => {
      const integer_last_buddy_notification = parseInt(buddy.last_buddy_notification, 10);
      if (now - integer_last_buddy_notification < 7200000) {
        return;
      }

      push(buddy, `${me_the_user[0].username} just opened up ${chapters[chapter_opened]}`);
      const update_last_sent = await knex.update({ last_buddy_notification: now }).table("users").where({ id: buddy.id }).returning("*");
    });
  } catch (error) {
    console.log("error in /buddy:", error);
  }
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Listening on http server ${process.env.PORT}.`);
});

///////////////////////////// CHRON JOBS  ///////////////////////////////////////////////////////////
// my_threads
cron.schedule("*/3 * * * *", async () => {
  // Get me a list of unique users that have commented anywhere on the platform.
  const list = await knex.raw("SELECT DISTINCT user_id from comments");
  // LOOPING THROUGH EACH UNIQUE USER WHO HAS COMMENTED //
  for (const item of list.rows) {
    // Get my unique posts (again we are only getting comment ids not the full object)
    const a = await knex.raw(`SELECT id, thread_id from comments where user_id = ${item.user_id}`);
    let array: any = [];

    a.rows.forEach((element) => {
      if (!element.thread_id) {
        array.push(element.id);
        return;
      }
      array.push(element.thread_id);
    });

    const uniq = [...new Set(array)];
    const stringified = JSON.stringify(uniq);
    const update = await knex.update({ my_threads: stringified }).table("users").where({ id: item.user_id });
  }
});
