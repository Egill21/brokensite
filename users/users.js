/** @module users */

require('dotenv').config();

const express = require('express');
const {
  findById, 
  findByUsername,
  create,
  getUsers,
  comparePasswords,
} = require('./usersUtils');

const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');

const {
  JWT_SECRET: jwtSecret,
  TOKEN_LIFETIME: tokenLifetime = 80,
} = process.env;

if (!jwtSecret) {
  console.error('JWT_SECRET not registered in .env');
  process.exit(1);
}

const router = express.Router();
// router.use(express.json());

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

/**
 * Higher-order fall sem umlykur async middleware með villumeðhöndlun.
 *
 * @param {function} fn Middleware sem grípa á villur fyrir
 * @returns {function} Middleware með villumeðhöndlun
 */
function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function strat(data, next) {
  console.log(`blablabal`);
  const user = await findById(data.id);
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}

passport.use(new Strategy(jwtOptions, strat));

router.use(passport.initialize());

function requireAuthentication(req, res, next) {
  return passport.authenticate(
    'jwt',
    { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        const error = info.name === 'TokenExpiredError' ?
          'expired token' : 'invalid token';

        return res.status(401).json({ error });
      }

      req.user = user;
      return next();
    },
  )(req, res, next);
}


async function users(req, res) {
  const result = await getUsers();
  return res.json(result);
}

async function getUser(req, res) {
  const { id } = req.params;
  const result = await findById(id);
  if (result) {
    return res.json(result);
  }
  return res.status(404).json({ error: 'User not found' });
}

async function createUser(req, res) {
  const { username, email, password } = req.body;
  const data = {
    username: username,
    email: email,
    password: password
  };
  const result = await create(data);

  return res.json(result);
}

async function loggingIn(req, res) {
  const { username, password = '' } = req.body;

  const user = await findByUsername(username);

  if (!user) {
    return res.status(401).json({ error: 'No such user' });
  }

  const passwordIsCorrect =
    await comparePasswords(password, user.password);

  if (passwordIsCorrect) {
    const payload = { id: user.id };
    const tokenOptions = { expiresIn: tokenLifetime };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid password' });
}

function getUserInfo(req, res) {
  return res.json({ baba: 'sdgasgd' });
}

router.get('/', catchErrors(users));
router.get('/me', requireAuthentication, getUserInfo);

/* router.get('/me', passport.authenticate('jwt', { session: false }), function(req, res){
  res.json("Success! You can not see this without a token");
}); */

router.get('/:id', catchErrors(getUser));
router.post('/register', catchErrors(createUser));
router.post('/login', catchErrors(loggingIn));


module.exports = router;
