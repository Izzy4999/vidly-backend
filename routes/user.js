const router = require("express").Router();
const { User, validate, loginValidation } = require("../models/user");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");

// get user details
router.get("/me", auth, async (req, res) => {
  const user = await User.findOne(req.user.email).select("-password");
  res.status(200).json({
    message: "success",
    statusCode: 200,
    data: {
      name: user.name,
      email: user.email,
    },
  });
});

//get all user
router.get("/", [auth, admin], async (req, res) => {
  const user = await User.find();
  res.status(200).json(user);
});

router.post("/register", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["_id", "name", "email"]));
});

// login user
router.post("/login", async (req, res) => {
  // validating form
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  // checking if user exist
  const emailExist = await User.findOne({ email: req.body.email });
  if (!emailExist) return res.status(400).send("email or password incorrect");

  // checkingpassword
  const password = await bcrypt.compare(req.body.password, emailExist.password);
  if (!password) return res.status(400).send("invalid email or password");

  const token = emailExist.generateAuthToken();
  res.header("x-auth-token", token).status(200).send(token);
});

// updating the user
router.put("/me", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error)
    return res.json({ statusCode: 400, message: error.details[0].message });
  const salt = await bcrypt.genSalt(10);
  const newpassword = await bcrypt.hash(req.body.password, salt);
  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    {
      name: req.body.name,
      email: req.body.email,
      password: newpassword,
    },
    { new: true }
  );

  if (!user) return res.status(404).send("user not found");

  res.status(200).json({
    statusCode: 200,
    message: "details updated",
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
    },
  });
});

// deleting user
router.delete("/me", auth, async (req, res) => {
  const user = await User.findOneAndRemove({ email: req.user.email });

  res.status(200).json({ message: "success", statusCode: 200 });
});
module.exports = router;
