require("dotenv").config();
import jwt from "jsonwebtoken";
const jwt_secret = process.env.JWT_SECRET;

export default function getAuth(req) {
  return new Promise(async (resolve, reject) => {
    // JWT user makes a claim. We verify that claim with this insane aspect of cryptopgraphy. (just a key on server side)
    const token = req.headers.token;
    try {
      const payload = jwt.verify(token, jwtKey);
    } catch (e) {
      if (e instanceof jwt.JsonWebTokenError) {
        // if the error thrown is because the JWT is unauthorized, return a 401 error
        console.log("ERROR THROWN: JWT is unauthorized", e);
      }
      // otherwise, return a bad request error
      console.log("ERROR THROWN: BAD REQUEST", e);
    }
  });
}

/*
Authentication Procedures:

(1) User needs to first obtain a valid jwt ↔️

(2) We must verify jwt on each graphql api request

---
How Are Users Signing in? **Market research! USER NAME?

(a) Email + Password -- email is absolute. what we do with the rest is tbd later.
(b)
*/
