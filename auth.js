const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const Strategy = require("passport-local").Strategy;

const Users = require("./models/users");
const autoCatch = require("./lib/auto-catch");

const jwtSecret = process.env.JWT_SECRET || "woofie woofie";
const adminPassword = process.env.ADMIN_PASSWORD || "adminadmin";
const jwtOpts = { algorithm: "HS256", expiresIn: "30d" };

passport.use(adminStrategy());
const authenticate = passport.authenticate("local", { session: false });

module.exports = {
  authenticate,
  login: autoCatch(login),
  ensureUser: autoCatch(ensureUser),
};

async function login(req, res, next) {
  const token = await sign({ username: req.user.username });
  res.cookie("jwt", token, { httpOnly: true });
  res.json({ success: true, token: token });
}

async function ensureUser(req, res, next) {
  const jwtString = req.headers.authorization || req.cookies.jwt;
  const payload = await verify(jwtString);
  if (payload.username) {
    req.user = payload;
    if (req.user.username === "admin") req.isAdmin = true;
    return next();
  }

  const err = new Error("Unauthorized");
  err.statusCode = 401;
  next(err);
}

async function sign(payload) {
  const token = await jwt.sign(payload, jwtSecret, jwtOpts);
  return token;
}

async function verify(jwtString = "") {
  jwtString = jwtString.replace(/^Bearer /i, "");
  try {
    const payload = await jwt.verify(jwtString, jwtSecret);
    return payload;
  } catch (err) {
    console.error(err);
    err.statusCode = 401;
    throw err;
  }
}

function adminStrategy() {
  return new Strategy(async function (username, password, cb) {
    const isAdmin = username === "admin" && password === adminPassword;
    if (isAdmin) return cb(null, { username: "admin" });

    try {
      const user = await Users.get(username);
      if (!user) return cb(null, false);

      const isUser = await bcrypt.compare(password, user.password);
      if (isUser) return cb(null, { username: user.username });
    } catch (err) {
      console.log(err);
    }

    cb(null, false);
  });
}
