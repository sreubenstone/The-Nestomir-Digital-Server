const knex = require("../db/knex.js");
import { push } from "./push";

const authGuard = (next) => (root, args, context, info) => {
  if (!context.user) {
    throw new Error(`If you are seeing this error message it means you are Unauthenticated! You must log out and log back in.`);
  }

  return next(root, args, context, info);
};

function avatar() {
  const imgs = [
    "https://kids.nationalgeographic.com/content/dam/kids/photos/animals/Mammals/H-P/pig-young-closeup.ngsversion.1412640764383.jpg",
    "https://cdn.pixabay.com/photo/2016/03/09/15/18/pig-1246584_960_720.jpg",
    "https://media2.s-nbcnews.com/j/newscms/2019_15/1425069/barsik-41-pound-cat-today-main-190411-05_1e8dd7af73408f9713c40a6c699422a3.fit-760w.jpg",
    "https://s3.amazonaws.com/spectrumnews-web-assets/wp-content/uploads/2018/11/13154625/20181112-SHANK3monkey-844.jpg",
    "https://cdn.vox-cdn.com/thumbor/Or0rhkc1ciDqjrKv73IEXGHtna0=/0x0:666x444/1200x800/filters:focal(273x193:379x299)/cdn.vox-cdn.com/uploads/chorus_image/image/59384673/Macaca_nigra_self-portrait__rotated_and_cropped_.0.jpg",
    "https://s3.amazonaws.com/cdn-origin-etr.akc.org/wp-content/uploads/2018/09/10222609/shiba-inu-funny-close-up-portrait.jpg",
    "https://store-images.s-microsoft.com/image/apps.16144.9007199266425000.e85a84c4-8eca-435c-acd0-67b6a00f5003.bb42a209-51fa-497c-9820-a245bb01b281?mode=scale&q=90&h=300&w=300",
    "http://cdn.akc.org/content/article-body-image/funny-basset_hound_yawning.jpg",
    "https://media.mnn.com/assets/images/2013/09/funny%20dog2.jpg.560x0_q80_crop-smart.jpg",
    "https://images.unsplash.com/photo-1534958210670-31215027cb02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80",
  ];

  const selection = imgs[Math.floor(Math.random() * imgs.length)];
  return selection;
}

async function send_thread_notifications(thread_id: number, commenter_id: number, body: string) {
  // This function sends a push to every user with a valid push token, filtering out the commenter only.
  const commenter_info = await knex.select().table("users").where({ id: commenter_id });
  const thread = await knex.select().table("comments").where({ id: thread_id });
  const user_base = await knex.select().table("users").whereNotNull("push_token");
  const filtered_user_base = user_base.filter((user) => user.id !== commenter_id);
  filtered_user_base.forEach(async (user) => push(user, `${commenter_info[0].username} commented in the thread ${thread[0].title}: "${body}"`));
}

// BELOW IS CODE FOR WHEN WE WANT TO FILTER PUSH BY USERS WHO COMMENTED IN THREAD ONLY
// async function send_thread_notifications(thread_id: number, commenter_id: number, body: string) {
//   // Send a push notification to every user in the thread...once...and do not send to the person making the comment
//   const commenter_info = await knex.select().table("users").where({ id: commenter_id });
//   const commenters = await knex.select().table("comments").distinct("user_id").where({ thread_id });
//   let commenter_array: any = [];
//   commenters.forEach((element) => {
//     commenter_array.push(element.user_id);
//   });
//   // BAD DOCUMENTATION BELOW, THAT IS NOT THE THREAD POSTER THAT IS THE THREAD!
//   const thread_poster = await knex.select().table("comments").where({ id: thread_id });
//   commenter_array.push(thread_poster[0].user_id);
//   const remove_dupes = [...new Set(commenter_array)];
//   const filter_commenter = remove_dupes.filter((item) => item !== commenter_id);
//   filter_commenter.forEach(async (user) => {
//     const userOb = await knex.select().table("users").where({ id: user });
//     push(userOb[0], `${commenter_info[0].username} commented in the thread ${thread_poster[0].title}: "${body}"`);
//   });
// }

async function pushBlastUserBase(message_body: string) {
  const users = await knex.select().table("users").whereNotNull("push_token");
  users.forEach((user) => {
    if (user.pause_push) {
      return;
    }
    push(user, message_body);
  });
}

export { authGuard, avatar, send_thread_notifications, pushBlastUserBase };
