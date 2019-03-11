const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require("../config/keys");
const mongoose = require("mongoose");

const User = mongoose.model("users");

//have to enable passport to use cookies
passport.serializeUser((user, done) => {
  done(null, user.id); // NOT PROFILE.ID, id from mongo
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});
//tells passport to use GoogleStrategy
//done function = tells passport we're done proceed with authentication flow
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback",
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      //async action
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        return done(null, existingUser); //2 args | err & user record
      }
        const user = await new User({googleId: profile.id}).save()
        done(null, user);
    }
  )
);
