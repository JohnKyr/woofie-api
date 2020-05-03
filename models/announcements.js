const cuid = require("cuid");
const db = require("../db");

const Announcement = db.model("Announcement", {
  _id: { type: String, default: cuid },
  text: {
    type: String,
    required: "You must supply an announcement",
  },
  user: {
    type: String,
    ref: "User",
    required: "You must supply a user",
  },
});

module.exports = {
  get,
  list,
  create,
  edit,
  remove,
  model: Announcement,
};

async function list(opts = {}) {
  const { offset = 0, limit = 25, username } = opts;

  const query = {};
  if (username) query.user = username;

  const announcements = await Announcement.find(query)
    .sort({ _id: 1 })
    .skip(offset)
    .limit(limit)
    .exec();

  return announcements;
}

async function get(_id) {
  const announcement = await Announcement.findById(_id).populate("user").exec();
  return announcement;
}

async function create(fields) {
  const announcement = await new Announcement(fields).save();
  await announcement.populate("user").execPopulate();
  return announcement;
}

async function edit(_id, change) {
  const announcement = await Announcement.findById(_id);
  Object.keys(change).forEach(function (key) {
    user[key] = change[key];
  });
  await announcement.save();
  return announcement;
}

async function remove(_id) {
  await Announcement.deleteOne({ _id });
}
