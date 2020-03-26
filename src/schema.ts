require("dotenv").config();
import { gql } from "apollo-server";
import { makeExecutableSchema } from "graphql-tools";
import { authGuard } from "./utilities";

const typeDefs = gql`
  type User {
    id: Int
    username: String
  }

  type Query {
    getAuth: User
  }
`;

const resolvers = {
  Query: {
    getAuth: (root, args, ctx) => {
      return { id: ctx.user, username: ctx.username };
    }
    // getProtected: authGuard((root, args, context) => {
    //   console.log("user here:", context);
    // })
  }
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

export default schema;
