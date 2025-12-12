import { Strategy as JwtStrategy } from 'passport-jwt';
import User from '../modules/users/users.schema.js';
import Blacklist from '../modules/auth/blacklist.schema.js';

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  return token;
};


const configurePassport = (passport) => {
  const options = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.JWT_SECRET,
    passReqToCallback: true,
  };

  passport.use(
    new JwtStrategy(options, async (req, jwt_payload, done) => {
      try {
        const token = cookieExtractor(req);

        const isBlacklisted = await Blacklist.findOne({ token });
        if (isBlacklisted) {
          return done(null, false, { message: 'Token has been revoked' });
        }

        const user = await User.findById(jwt_payload.id).select('-password');
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

export default configurePassport;