require("dotenv").config();
import { gql } from "apollo-server";
import { makeExecutableSchema } from "graphql-tools";
import { authGuard } from "./utilities";
import knexlib from "knex";
import { development } from "../knexfile"
const knex = knexlib(development);

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

  type Mutation {
    updateBookmark(chapter: Int, position: Int): Bookmark
  }
`;

const resolvers = {
  Query: {
    getAuth: (root, args, ctx) => {
      return { id: ctx.user, username: ctx.username };
    },

    getBookmark: authGuard(async (root, args, ctx) => {
      const bookmarks = await knex.select().table('bookmarks').where({ user_id: ctx.user })
      return bookmarks[0]
    })
  },

  Mutation: {
    updateBookmark: authGuard(async (root, args, ctx) => {
      const { chapter, position } = args
      try {
        const result = await knex.update({ chapter, position }).table('bookmarks').where({ user_id: ctx.user }).returning('*')
        return result[0]
      } catch (error) {
        console.log(error)
      }
    })
  }
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

export default schema;
