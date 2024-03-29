require("dotenv").config();
import jwt from "jsonwebtoken";
const jwt_secret = process.env.JWT_SECRET;

// This file contains our authentication logic (it comes in the form of a Promise which gets leveraged by our server.ts file, and passed into graphQL context)

export default function getAuth(req) {
  return new Promise(async (resolve, reject) => {
    // JWT user makes a claim. We verify that claim.
    const token = req.headers.authorization;

    if (!token) {
      console.log("The user has no token.");
      resolve({ user: null });
      return;
    }

    try {
      const payload = jwt.verify(token, jwt_secret);
      const data = {
        user: payload.user,
        username: payload.username,
      };
      resolve(data);
    } catch (e) {
      if (e instanceof jwt.JsonWebTokenError) {
        // if the error thrown is because the JWT is unauthorized, return a 401 error
        console.log("ERROR THROWN: JWT is unauthorized", e);
        resolve({ user: null });
        return;
      }
      // otherwise, return a bad request error
      console.log("ERROR THROWN: BAD REQUEST", e);
      resolve({ user: null });
    }
  });
}
