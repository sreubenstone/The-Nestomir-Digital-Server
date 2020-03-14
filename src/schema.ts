require("dotenv").config();
import { gql } from "apollo-server";
import { makeExecutableSchema } from "graphql-tools";
import { authGuard } from "./auth";

const typeDefs = gql`
  type User {
    id: Int
    First_Name: String
    Last_Name: String
  }

  type Query {
    getAuth: User
  }
`;

const resolvers = {
  Query: {
    getAuth: (root, args, ctx) => {
      return { id: ctx.user };
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
