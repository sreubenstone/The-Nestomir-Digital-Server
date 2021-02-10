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

  type Comment {
    id: Int
    user_id: Int
    user: User
    thread_id: Int
    is_post: Boolean
    title: String
    body: String
    time: TimeInfo
    rel_chapter: Int
    audio: String
    thread_updated: Int
    created_at: String
    replies: Connection
  }

  type Connection {
    edges(after: Int): [Comment]
    pageInfo: PageInfo
  }

  type PageInfo {
    oldestReplyCursor: Int
  }

  type TimeInfo {
      time_stamp: String
  }



  type Query {
    getAuth: User
    getBookmark: Bookmark
    getThread(thread_id: Int): Comment
    getComments(thread_id: Int, before: Int): [Comment]
    getForumThreads: [Comment]
    getChapterThreads(chapter_id: Int): [Comment]
  }

  type Mutation {
    submitComment(thread_id: Int, body: String): Comment
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
    }),

    getThread: async (root, args, ctx) => {
      const thread = await knex.select().table('comments').where({ id: args.thread_id })
      return thread[0]
    },

    getComments: async (root, args, ctx) => {
      const replies = await knex.select().table('comments').orderByRaw('created_at DESC').where('id', '<', args.before).andWhere({ thread_id: args.thread_id }).limit(5)
      return replies.reverse()
    },

    getForumThreads: authGuard(async (root, args, ctx) => {
      const posts = await knex.select().table('comments').where({ is_post: true })
      return posts
    }),

    getChapterThreads: authGuard(async (root, args, ctx) => {
      const posts = await knex.select().table('comments').where({ rel_chapter: args.chapter_id })
      return posts
    }),

  },

  Mutation: {
    submitComment: authGuard(async (root, args, ctx) => {
      const comment = await knex.insert({ thread_id: args.thread_id, body: args.body, user_id: ctx.user, is_post: false }).table('comments').returning('*')
      return comment[0]
    }),

    updateBookmark: authGuard(async (root, args, ctx) => {
      const { chapter, position } = args
      try {
        const result = await knex.update({ chapter, position }).table('bookmarks').where({ user_id: ctx.user }).returning('*')
        return result[0]
      } catch (error) {
        console.log(error)
      }
    })
  },

  Comment: {
    user: async (parent, args, ctx) => {
      const user = await knex.select().table('users').where({ id: parent.user_id })
      return user[0]
    },

    replies: async (parent, args, ctx) => {
      return parent.id
    },

    time: (parent) => {
      const ts = JSON.stringify(parent.created_at)
      const stamp = {
        time_stamp: ts
      }
      return stamp
    },

  },

  Connection: {
    edges: async (parent, args, ctx) => {
      const replies = await knex.select().table('comments').orderByRaw('created_at DESC').where({ thread_id: parent }).limit(3)
      return replies.reverse()
    },

    pageInfo: async (parent, args, ctx) => {
      const all_thread_replies = await knex.select().table('comments').where({ thread_id: parent }).orderByRaw('created_at ASC')
      if (!all_thread_replies.length) { return { oldestReplyCursor: null } }
      return { oldestReplyCursor: all_thread_replies[0].id }
    },
  },

}
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

export default schema;