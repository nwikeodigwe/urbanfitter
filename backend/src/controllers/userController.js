const User = require("../utils/User");
const Style = require("../utils/Style");
const Collection = require("../utils/Collection");

exports.getAllUsers = async (req, res) => {
  let user = new User();
  let users = await user.findMany();

  if (users.length == 1)
    return res.status(404).json({ message: "No user found" });

  res.status(200).json({ users });
};

exports.subscribeToUser = async (req, res) => {
  let user = new User();
  user.id = req.params.user;
  let userExists = await user.findById();

  if (!userExists) return res.status(404).json({ message: "User not found" });

  user.id = req.user.id;
  let isSubscribed = await user.isSubscribedTo(req.params.user);

  if (isSubscribed)
    return res.status(400).json({ message: "Already subscribed" });

  let subscription = await user.subscribeTo(req.params.user);

  res.status(201).json({ subscription });
};

exports.unsubscribeFromUser = async (req, res) => {
  let user = new User();
  user.id = req.params.user;
  let userExists = await user.findById();

  if (!userExists) return res.status(404).json({ message: "User not found" });

  user.id = req.user.id;
  let isSubscribed = await user.isSubscribedTo(req.params.user);

  if (!isSubscribed) return res.status(400).json({ message: "Not subscribed" });

  await user.unsubscribeFrom(req.params.user);

  res.status(200).end();
};

exports.getCurrentUser = async (req, res) => {
  let user = new User();
  user.id = req.user.id;
  user = await user.findById();

  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json({ user });
};

exports.updateUser = async (req, res) => {
  let user = new User();
  user.id = req.user.id;
  user.name = req.body.name;
  user.email = req.body.email;

  user = await user.save();

  res.status(200).json({ user });
};

exports.updateProfile = async (req, res) => {
  let user = new User();
  user.id = req.user.id;

  const data = {
    ...(req.body.firstname !== undefined && { firstname: req.body.firstname }),
    ...(req.body.lastname !== undefined && { lastname: req.body.lastname }),
    ...(req.body.bio !== undefined && { bio: req.body.lastname }),
  };

  const profile = await user.updateProfile(data);

  return res.status(200).json({ profile });
};

exports.getUserStyle = async (req, res) => {
  let user = new User();
  user.id = req.params.user;
  user = await user.findById();

  if (!user) return res.status(404).json({ message: "User not found" });

  let style = new Style();
  style = await style.findMany({ userId: user.id });

  if (!style.length) return res.status(404).json({ message: "No style found" });

  return res.status(200).json({ style });
};

exports.getUserCollection = async (req, res) => {
  let user = new User();
  user.id = req.user.id;
  user = await user.findById();

  if (!user) return res.status(404).json({ message: "User not found" });

  let collection = new Collection();
  collection = await collection.findMany({ userId: user.id });

  if (!collection.length)
    return res.status(404).json({ message: "No collection found" });

  return res.status(200).json({ collection });
};

exports.updatePassword = async (req, res) => {
  let user = new User();
  user.id = req.user.id;

  let password = await user.passwordMatch(req.body.password);

  if (!password) return res.status(400).json({ message: "Invalid password" });

  user.password = req.body.newpassword;
  await user.save();

  res.status(200).end();
};

exports.getUserById = async (req, res) => {
  let user = new User();
  user.id = req.params.user;
  user = await user.findById();

  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json({ user });
};
