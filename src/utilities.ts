/// This file contains a mix and mash of utility functions (this should be refactored/re-organized)
const knex = require("../db/knex.js");
import { push } from "./push";
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const Mixpanel = require("mixpanel");
const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// This function sends server events to our analytics tool, Mixpanel
const mixPanel = (user_id: number, event_name: string) => {
  if (process.env.PROD === "true") {
    mixpanel.track(event_name, { distinct_id: user_id });
  }
};

// This function is leveraged by our graphQL resolvers  to check if a user is logged in
const authGuard = (next) => (root, args, context, info) => {
  if (!context.user) {
    throw new Error(`If you are seeing this error message it means you are Unauthenticated! You must log out and log back in.`);
  }
  return next(root, args, context, info);
};

// This function finds a user's reading buddies
async function getBuddies(user_id) {
  return new Promise(async (resolve, reject) => {
    try {
      const connections = await knex.raw(`SELECT * FROM connections where connections.user_a = ${user_id} or connections.user_b = ${user_id}`);
      // if no reading buddies return
      if (!connections.rows.length) {
        resolve(null);
        return;
      }
      // get the id's of your reading buddies
      let list: any = [];
      connections.rows.forEach((item) => {
        list.push(item.user_a);
        list.push(item.user_b);
      });
      // filter out you
      const me_filter = list.filter((item) => item !== user_id);
      let id_set = "";
      me_filter.forEach((id) => {
        id_set += +id + ",";
      });
      const correct_id_set = id_set.slice(0, -1);
      const sql = `SELECT * FROM users WHERE id IN (${correct_id_set})`;
      const buddies = await knex.raw(sql);
      resolve(buddies.rows);
    } catch (error) {
      console.log("Error in buddy resolution:", error);
    }
  });
}

// This function assigns a new user a random avatar
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

// BELOW IS CODE FOR WHEN WE WANT TO FILTER PUSH BY USERS WHO COMMENTED IN THREAD ONLY - I DON'T THINK WE COPIED FUNCTION ABOVE PERFECTLY (DIDN'T ADD IN APP NOTIFICATIONS)
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

// This function blasts a push notification to all users
async function pushBlastUserBase(message_body: string) {
  const users = await knex.select().table("users").whereNotNull("push_token");
  users.forEach((user) => {
    if (user.pause_push) {
      return;
    }
    push(user, message_body);
  });
}

// This function sends a welcome email to a new user who signs up for the app
function sendWelcomeEmail(email: string, firstname: string) {
  const body = `${firstname},
  <br><br>
  You have successfully signed up for The Nestomir Premium Native App. Welcome to the adventure ✨!
  <br>
  <h3>App Tips</h3>
  <b>Bookmarking:</b> Save your reading position. Inside a chapter view tap the screen once and you will see the bookmark pane appear. (you can only have one bookmark)
  <br><br>
  <b>Reading Buddies:</b> Stay in sync with your friend's reading positions (through push notifications) by adding them as reading buddies. To add a reading buddy, click the lightning icon on the story screen - the instructions there will provide you with your secret reader code which can be used by your friends to add you as a buddy.
  <br><br>
  <b>Story Forum:</b> Use the story forum, including the Book Club thread, to discuss the story and lesson topics. Threads with the microphone icon 🎤indicate there is a soundbite.
  <br><br>
  Please message me if you have any questions at all...happy to offer my time and insight on any topics related to the story, coding, or learning in general. 
  <br><br>
  Sincerely,
  <br><br>
  Steven Reubenstone<br>
  <i>Author, Founder, The Nestomir<i>`;

  const msg = {
    to: email,
    from: "steven@thenestomir.com",
    subject: "Welcome to The Nestomir Premium - Let's Get You Started",
    text: "and easy to do anywhere, even with Node.js",
    html: body,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Welcome email sent to user");
    })
    .catch((error) => {
      console.error(error);
    });
}

// This function sends an email to a user who has successfully referred another user
async function sendReferralEmail(referral_id: number) {
  const referral = await knex.select().table("referrals").where({ id: referral_id });
  const referring_user = await knex.select().table("users").where({ id: referral[0].user_id });
  const referred_user = await knex.select().table("users").where({ id: referral[0].referred });

  const body = `${referring_user[0].username},
<br><br>
You have successfully referred user: ${referred_user[0].username} to The Nestomir. We will be reaching out soon to provide you with your cash reward...this may take us a few weeks...so bear with us. Note, rewards will only be redeemable through PayPal or Venmo at the moment. If that is not an acceptable form of payment, your balance will remain in tact until we add new pay out mechanisms.
<br><br>
Sincerely,
<br><br>
Steven Reubenstone<br>
<i>Author, Founder, The Nestomir<i>`;

  const msg = {
    to: referring_user[0].email,
    from: "steven@thenestomir.com", // Change to your verified sender
    subject: `You referred ${referred_user[0].username} to The Nestomir`,
    text: "and easy to do anywhere, even with Node.js",
    html: body,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Referral email sent to user");
    })
    .catch((error) => {
      console.error(error);
    });
}

export { mixPanel, authGuard, avatar, send_thread_notifications, pushBlastUserBase, sendWelcomeEmail, sendReferralEmail, getBuddies };
