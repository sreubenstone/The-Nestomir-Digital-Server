require("dotenv").config();
import { gql } from "apollo-server";
import bcrypt from "bcrypt";
import { makeExecutableSchema } from "graphql-tools";
import { push } from "./push";
import { authGuard, send_thread_notifications, pushBlastUserBase, mixPanel, getBuddies } from "./utilities";
const knex = require("../db/knex.js");
const Airtable = require("airtable");
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE);

// This is our entire graphQL (Apollo Server) schema – see all type defs and resolvers powering the API
// This file also obviously must be refactored to make it a lot cleaner and easier to read
// Do not worry about airtable, we are using this interally to store things like support requests coming from production app

const typeDefs = gql`
  type User {
    id: Int
    username: String
    tagline: String
    user_avatar: String
    bookmark: Bookmark
    threads: [Comment]
    push_token: String
    secret_code: String
  }

  type Bookmark {
    id: Int
    user_id: Int
    chapter: Int
    position: Int
    percentage: Float
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
    created_at: String
    thread_updated: Int
    replies: Connection
  }

  type Notification {
    id: Int
    user_id: Int
    read: Boolean
    body: String
    thread_id: Int
    thread_title: String
    notification_image: String
    time: TimeInfo
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
    thread_updated: String
  }

  type SupportRequest {
    id: Int
    user_id: Int
    body: String
  }

  type Query {
    getAuth: User
    getProfile(id: Int): User
    getBookmark: Bookmark
    getThread(thread_id: Int): Comment
    getComments(thread_id: Int, before: Int): [Comment]
    getForumThreads: [Comment]
    getChapterThreads(chapter_id: Int): [Comment]
    getMyNotifications: [Notification]
    getMyReadingBuddies: [User]
  }

  type Mutation {
    submitComment(thread_id: Int, body: String): Comment
    saveProfile(tagline: String): User
    saveProfilePicture(uri: String): User
    updateBookmark(chapter: Int, position: Int, percentage: Float): Bookmark
    addReadingBuddy(secret_code: String): User
    removeReadingBuddy(buddy_id: Int): User
    markRead: [Notification]
    savePushToken(push_token: String): User
    sendGenericPush(body: String, pw: String): Boolean
    mochaMojo(pw: String, user_id: Int, secret_key: String): User
    save_Support_Request(body: String): SupportRequest
  }
`;

const resolvers = {
  Query: {
    getAuth: async (root, args, ctx) => {
      if (!ctx.user) {
        return { id: ctx.user };
      }
      const user = await knex.select().table("users").where({ id: ctx.user });
      mixPanel(ctx.user, "log_in");
      return user[0];
    },

    getProfile: authGuard(async (root, args, ctx) => {
      const profile = await knex.select().table("users").where({ id: args.id });
      return profile[0];
    }),

    getBookmark: authGuard(async (root, args, ctx) => {
      const bookmarks = await knex.select().table("bookmarks").where({ user_id: ctx.user });
      return bookmarks[0];
    }),

    getThread: authGuard(async (root, args, ctx) => {
      const thread = await knex.select().table("comments").where({ id: args.thread_id });
      return thread[0];
    }),

    getComments: authGuard(async (root, args, ctx) => {
      const replies = await knex.select().table("comments").orderByRaw("created_at DESC").where("id", "<", args.before).andWhere({ thread_id: args.thread_id }).limit(5);
      return replies.reverse();
    }),

    getForumThreads: authGuard(async (root, args, ctx) => {
      const posts = await knex.select().table("comments").where({ is_post: true }).orderBy("thread_updated", "desc");
      return posts;
    }),

    getChapterThreads: authGuard(async (root, args, ctx) => {
      const book_club_thread = await knex.select().table("comments").where({ id: 10 });
      const posts = await knex.select().table("comments").where({ rel_chapter: args.chapter_id }).orderBy("thread_updated", "desc");
      posts.push(book_club_thread[0]);
      return posts;
    }),

    getMyNotifications: authGuard(async (root, args, ctx) => {
      const notifications = await knex.select().table("notifications").where({ user_id: ctx.user }).orderBy("created_at", "desc").limit(25);
      return notifications;
    }),

    getMyReadingBuddies: authGuard(async (root, args, ctx) => {
      const buddies = await getBuddies(ctx.user);
      return buddies;
    }),
  },

  Mutation: {
    submitComment: authGuard(async (root, args, ctx) => {
      const comment = await knex.insert({ thread_id: args.thread_id, body: args.body, user_id: ctx.user, is_post: false }).table("comments").returning("*");
      send_thread_notifications(args.thread_id, ctx.user, args.body);
      const update_time_stamp = await knex.update({ thread_updated: new Date() }).table("comments").where({ id: args.thread_id }).returning("*");
      // Good to know we are passing UTC to front, so this is accurate in all timezones.
      mixPanel(ctx.user, "comment");
      return comment[0];
    }),

    saveProfile: authGuard(async (root, args, ctx) => {
      const user = await knex.update({ tagline: args.tagline }).table("users").where({ id: ctx.user }).returning("*");
      return user[0];
    }),

    saveProfilePicture: authGuard(async (root, args, ctx) => {
      const user = await knex.update({ user_avatar: args.uri }).table("users").where({ id: ctx.user }).returning("*");
      return user[0];
    }),

    updateBookmark: authGuard(async (root, args, ctx) => {
      const { chapter, position, percentage } = args;
      try {
        const result = await knex.update({ chapter, position, percentage }).table("bookmarks").where({ user_id: ctx.user }).returning("*");
        mixPanel(ctx.user, "bookmark");
        return result[0];
      } catch (error) {
        console.log(error);
      }
    }),

    markRead: authGuard(async (root, args, ctx) => {
      const notifications = await knex.update({ read: true }).table("notifications").where({ user_id: ctx.user }).returning("*");
      return notifications;
    }),

    savePushToken: authGuard(async (root, args, ctx) => {
      const result = await knex.update({ push_token: args.push_token }).table("users").where({ id: ctx.user }).returning("*");
      return result[0];
    }),

    addReadingBuddy: authGuard(async (root, args, ctx) => {
      const { secret_code } = args;
      const look_up = await knex.select().table("users").where({ secret_code });
      // check if the secret code exists
      if (!look_up.length) {
        // issue gql error and display in front end
        throw new Error(`This secret reader code does not exist.`);
      }

      // Make sure you do not add yourself as a reading buddy
      if (ctx.user === look_up[0].id) {
        throw new Error(`You can not add yourself.`);
      }

      // now check if a connection exists (user_a user_b)
      const search = await knex.raw(`SELECT * FROM connections WHERE (user_a = ${ctx.user} and user_b = ${look_up[0].id}) or (user_a = ${look_up[0].id} and user_b = ${ctx.user})`);

      // connection is already there
      if (search.rows.length) {
        return { id: ctx.user };
      }

      // Standard case - connection is not there
      const create_connection = await knex.insert({ user_a: ctx.user, user_b: look_up[0].id }).table("connections").returning("*");
      const user = await knex.select().table("users").where({ id: ctx.user });
      push(look_up[0], `${user[0].username} added you as a reading buddy!`);
      mixPanel(ctx.user, "add_buddy");
      return create_connection[0];
    }),

    removeReadingBuddy: authGuard(async (root, args, ctx) => {
      const { buddy_id } = args;
      // find in connections where the connection exists which we know it does
      // DELETE * FROM connections WHERE (user_a = ${ctx.user} and user_b = ${user_id}) or (user_a = ${user_id} and user_b = ${ctx.user})
      const result_of_delete = await knex.raw(`DELETE FROM connections WHERE (user_a = ${ctx.user} and user_b = ${buddy_id}) or (user_a = ${buddy_id} and user_b = ${ctx.user})`);
      return result_of_delete[0];
    }),

    sendGenericPush: async (root, args) => {
      if (args.pw !== process.env.PUSH_PW) {
        return false;
      }
      pushBlastUserBase(args.body);
      return true;
    },

    mochaMojo: async (root, args) => {
      if (args.secret_key !== process.env.MOCHAMOJO) {
        return false;
      }
      // Salt PW, Update PW
      const hash = bcrypt.hashSync(args.pw, 12);
      const user = await knex.update({ password: hash }).where({ id: args.user_id }).table("users").returning("*");
      return user[0];
    },

    save_Support_Request: authGuard(async (root, args, ctx) => {
      if (process.env.PROD === "false") {
        return;
      }
      base("Tickets").create(
        [
          {
            fields: { user_id: ctx.user, Ticket: args.body },
          },
        ],
        function (err, records) {
          if (err) {
            console.error(err);
            return;
          }
        }
      );
      return args;
    }),
  },

  User: {
    bookmark: async (parent) => {
      const bookmark = await knex.select().table("bookmarks").where({ user_id: parent.id });
      return bookmark[0];
    },

    threads: async (parent) => {
      const user = await knex.select().table("users").where({ id: parent.id });
      const thread_list_string = user[0].my_threads;
      if (!thread_list_string) {
        return null;
      }
      const thread_list = JSON.parse(thread_list_string);
      // return from comments an array of rows
      let posts: any = [];
      for (const post_id of thread_list) {
        const post = await knex.select().table("comments").where({ id: post_id });
        posts.push(post[0]);
      }
      const posts_sorted = posts.sort(function (a, b) {
        return b.thread_updated - a.thread_updated;
      });

      return posts_sorted;
    },
  },

  Comment: {
    user: async (parent, args, ctx) => {
      const user = await knex.select().table("users").where({ id: parent.user_id });
      return user[0];
    },

    replies: async (parent, args, ctx) => {
      return parent.id;
    },

    time: (parent) => {
      const stamp = {
        time_stamp: JSON.stringify(parent.created_at),
        thread_updated: JSON.stringify(parent.thread_updated),
      };
      return stamp;
    },
  },

  Notification: {
    time: (parent) => {
      const stamp = {
        time_stamp: JSON.stringify(parent.created_at),
        thread_updated: null,
      };
      return stamp;
    },
  },

  Connection: {
    edges: async (parent, args, ctx) => {
      const replies = await knex.select().table("comments").orderByRaw("created_at DESC").where({ thread_id: parent }).limit(3);
      return replies.reverse();
    },

    pageInfo: async (parent, args, ctx) => {
      const all_thread_replies = await knex.select().table("comments").where({ thread_id: parent }).orderByRaw("created_at ASC");
      if (!all_thread_replies.length) {
        return { oldestReplyCursor: null };
      }
      return { oldestReplyCursor: all_thread_replies[0].id };
    },
  },
};
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;
