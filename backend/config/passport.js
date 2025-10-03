const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const winston = require('winston');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract Google profile data
        const googleId = profile.id;
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const picture = profile.photos[0]?.value;

        // Check if user already exists
        let user = await User.findOne({ googleId });

        if (user) {
          // Update existing user's last login and picture
          user.lastLogin = new Date();
          user.picture = picture;
          await user.save();

          winston.info(`Existing Google user logged in: ${email}`);
          return done(null, user);
        }

        // Check if user exists with same email (but no googleId)
        user = await User.findOne({ email });

        if (user) {
          // Link Google account to existing user
          user.googleId = googleId;
          user.picture = picture;
          user.name = user.name || name;
          user.lastLogin = new Date();
          await user.save();

          winston.info(`Google account linked to existing user: ${email}`);
          return done(null, user);
        }

        // Create new user
        user = new User({
          googleId,
          email,
          name,
          picture,
          lastLogin: new Date()
        });

        await user.save();

        winston.info(`New Google user registered: ${email}`);
        return done(null, user);

      } catch (error) {
        winston.error(`Google OAuth error: ${error.message}`);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
