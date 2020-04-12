require("dotenv").config();
import { gql } from "apollo-server";
import { makeExecutableSchema } from "graphql-tools";
import { authGuard } from "./utilities";

const typeDefs = gql`
  type User {
    id: Int
    username: String
  }

  type Bookmark {
    id: Int
    user_id: Int
    chapter: Int
    position: Int
  }

  type Query {
    getAuth: User
    getBookmark: Bookmark
  }
`;

const resolvers = {
  Query: {
    getAuth: (root, args, ctx) => {
      return { id: ctx.user, username: ctx.username };
    },

    getBookmark: (root, args, ctx) => {
      return { chapter: 1, position: 509 }
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
