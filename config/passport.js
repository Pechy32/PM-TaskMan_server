import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

export function setupPassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/api/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        const user = {
          provider: "google",
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value,
          providerAccessToken: accessToken,
        };
        return done(null, user);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
}
