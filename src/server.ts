require("dotenv").config();
import express from "express";
import schema from "./schema";
import graphqlHTTP from "express-graphql";
import { auth } from "./auth";

const app = express();

app.use(
  "/graphql",
  graphqlHTTP(async req => {
    const authData = auth(req);
    return {
      schema,
      context: authData,
      graphiql: true
    };
  })
);

const server = app.listen(process.env.PORT, () => {
  console.log(`Listening on http server ${process.env.PORT}.`);
});
