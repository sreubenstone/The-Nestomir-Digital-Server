require("dotenv").config();
const knexConfig = require("../knexfile").development;
const knex = require("knex")(knexConfig);
import express from "express";
import schema from "./schema";
import graphqlHTTP from "express-graphql";
import bodyParser from "body-parser";

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
  const { username, email, password } = req.body;
  /*
  -  (1) Does this email exist already? (must set everything to lower case)
  - (2) Does this user name exist already? (must set everything to lower case)
  */
  const email_check = await knex.select().table("users").where({ email: email });
  const username_check = await knex.select().table("users").where({ username: username });

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


  // passes checks
  //   const data = {
  //     status: 'success',
  //     token: token
  // }


  // const response = JSON.stringify(data)
  // res.send(response)


});

const server = app.listen(process.env.PORT, () => {
  console.log(`Listening on http server ${process.env.PORT}.`);
});
