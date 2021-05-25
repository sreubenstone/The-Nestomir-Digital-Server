require("dotenv").config();
import Expo from "expo-server-sdk";
const knex = require("../db/knex.js");

let expo = new Expo();

const push = async (user, body: string) => {
  const unreads = await knex.select().table("notifications").where({ user_id: user.id, read: false });

  const notification = {
    to: user.push_token,
    body: body,
    badge: unreads.length > 25 ? 25 : unreads.length,
    // This ternary is implemented because we only ever pull 25 latest notifications, don't want to confuse user.
  };

  if (!Expo.isExpoPushToken(user.push_token)) {
    console.error(`Push token ${user.push_token} is not a valid Expo push token`);
    return;
  }

  const notifications_array = [notification];
  let chunks = expo.chunkPushNotifications(notifications_array);

  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log("ticketChunk:", ticketChunk);
      } catch (error) {
        console.error("error:", error);
      }
    }
  })();
};

export { push };
