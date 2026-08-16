const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const env = require("../config/env");

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL || `http://localhost:${env.PORT}/api/oauth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("No email from Google"));

          const existingUser = await User.findOne({ email });
          if (existingUser) {
            return done(null, existingUser);
          }

          // Generate username from email prefix
          const username = email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase() || "user";

          const user = await User.create({
            username,
            email,
            password: `google-${profile.id}`,
            role: "customer",
          });

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

module.exports = passport;
