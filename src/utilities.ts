const knex = require("../db/knex.js");
import { push } from "./push";
require("dotenv").config();
const Mixpanel = require("mixpanel");
var mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);

const mixPanel = (user_id: number, event_name: string) => {
  if (process.env.PROD === "true") {
    mixpanel.track(event_name, { distinct_id: user_id });
  }
};

const authGuard = (next) => (root, args, context, info) => {
  if (!context.user) {
    throw new Error(`If you are seeing this error message it means you are Unauthenticated! You must log out and log back in.`);
  }

  return next(root, args, context, info);
};

function avatar() {
  const imgs = [
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280919/ProfilePhotos/463527_ncz9tj.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280919/ProfilePhotos/depositphotos_17461085-stock-photo-funny-dachshund_r28len.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280919/ProfilePhotos/Top-10-Funny-Dog-Quotes-810x608_biqykz.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280919/ProfilePhotos/photo-1541364983171-a8ba01e95cfc_olwper.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280919/ProfilePhotos/15funny1_otssq8.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280919/ProfilePhotos/0_0_850_1_100__News_meetissai-frankie6_ecbz3a.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280919/ProfilePhotos/01_36_xdlso0.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280919/ProfilePhotos/image_slt7ar.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280919/ProfilePhotos/16cab153397fc070d5369635ba891e8d_agplz0.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280918/ProfilePhotos/photo-1530041539828-114de669390e_hfp3hk.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280918/ProfilePhotos/funny-dog-halloween-costumes-1600276912_trivqg.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280918/ProfilePhotos/perfectly-timed-cat-photos-funny-cover_lilyip.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280918/ProfilePhotos/Funny-Cat-Names-HC-long_n7nbqb.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280918/ProfilePhotos/portrait-funny-dog-behind-wheel-car-jack-russell-terrier-sunglasses-151057370_ak9i5w.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280918/ProfilePhotos/istockphoto-1253696116-170667a_afgxex.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280918/ProfilePhotos/funny-basset_hound_yawning_qunyat.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280917/ProfilePhotos/Funny-dog-faces-the-end_ilmikg.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280917/ProfilePhotos/funny-dog-1521575287_av22io.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280917/ProfilePhotos/images_zmvm1w.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280917/ProfilePhotos/image-1_oosjve.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280917/ProfilePhotos/dog-costume-1_uv7mw1.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280917/ProfilePhotos/YbQegxv-_bwjtbr.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280917/ProfilePhotos/cute-dog-couch-AllPaws-facebook_tw5hmo.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280917/ProfilePhotos/pets-sleep-jumbo_swibi6.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1628280917/ProfilePhotos/1fab45885590d8341279a6c4a0e4ad8d_k87eq7.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1620437485/ProfilePhotos/g4ot5okyaivekpuf3uul.jpg",
    "https://res.cloudinary.com/dshxqbjrf/image/upload/v1617236916/ProfilePhotos/barsik-41-pound-cat-today-main-190411-05_1e8dd7af73408f9713c40a6c699422a3.fit-760w_glphsb.jpg",
  ];

  const selection = imgs[Math.floor(Math.random() * imgs.length)];
  return selection;
}

async function send_thread_notifications(thread_id: number, commenter_id: number, body: string) {
  // This function sends a push to every user with a valid push token, filtering out the commenter only
  // + it now sends a generic (db) notification to every user in the userbase, filtering out commenter.
  // Scale: Dataloader or in the future a separate microservice could handle these procedures.I also see you don't need to go back to the DB, you could filter pushers from main userbase.
  const commenter_info = await knex.select().table("users").where({ id: commenter_id });
  const thread = await knex.select().table("comments").where({ id: thread_id });
  const user_base_has_push_token = await knex.select().table("users").whereNotNull("push_token");
  const filtered_user_base_has_push_token = user_base_has_push_token.filter((user) => user.id !== commenter_id);
  const full_user_base = await knex.select().table("users");
  const full_user_base_without_commenter = full_user_base.filter((user) => user.id !== commenter_id);
  filtered_user_base_has_push_token.forEach(async (user) => push(user, `${commenter_info[0].username} commented in the thread ${thread[0].title}: "${body}"`));
  full_user_base_without_commenter.forEach(
    async (user) =>
      await knex
        .insert({ user_id: user.id, thread_id, thread_title: thread[0].title, notification_image: commenter_info[0].user_avatar, body: `${commenter_info[0].username} commented in the thread ${thread[0].title}: "${body}"` })
        .table("notifications")
  );
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
// THIS FUNCTION IS NOT UPDATED WITH DATABASE NOTIFICATION LINE
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

export { mixPanel, authGuard, avatar, send_thread_notifications, pushBlastUserBase };
