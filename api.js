const Announcements = require("./models/announcements");
const Users = require("./models/users");
const autoCatch = require("./lib/auto-catch");

module.exports = autoCatch({
  getAnnouncement,
  createAnnouncement,
  listAnnouncements,
  createUser,
});

async function getAnnouncement(req, res, next) {
  const { id } = req.params;

  const announcement = await Announcements.get(id);
  if (!announcement) return next();
  res.json(announcement);
}

async function createAnnouncement(req, res, next) {
  const fields = req.body;

  if (!req.isAdmin) fields.username = req.user.username;

  const announcement = await Announcements.create(req.body);

  res.json(announcement);
}

async function listAnnouncements(req, res, next) {
  const { offset = 0, limit = 25 } = req.query;

  const opts = {
    offset: Number(offset),
    limit: Number(limit),
  };

  if (!req.isAdmin) opts.username = req.user.username;

  const announcements = await Announcements.list(opts);

  res.json(announcements);
}

async function createUser(req, res, next) {
  const user = await Users.create(req.body);
  const { username, email } = user;
  res.json({ username, email });
}

function forbidden(next) {
  const err = new Error("Forbidden");
  err.statusCode = 403;
  return next(err);
}
