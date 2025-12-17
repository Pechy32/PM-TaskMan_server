import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../model/userModel.js";

export function setupPassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/api/auth/google/callback",
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;

          if (!email) {
            return done(new Error("Google account has no email"));
          }

          let user = await User.findOne({ googleId });

          if (!user) {
            user = await User.findOne({ email });

            if (user) {
              user.googleId = googleId;
              await user.save();
            }
          }

          if (!user) {
            user = await User.create({
              name,
              email,
              googleId,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
