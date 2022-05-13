const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 6,
    max: 220,
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 220,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 20000,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      isAdmin: this.isAdmin,
      name: this.name,
      email: this.email,
    },
    process.env.PRIVATE_KEY
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(data) {
  const schema = Joi.object({
    name: Joi.string().min(6).max(220).required(),
    email: Joi.string()
      .email({ tlds: { allow: ["com", "net"] } })
      .min(6)
      .max(220)
      .required(),
    password: Joi.string().min(6).max(2000).required(),
    isAdmin: Joi.boolean(),
  });
  return schema.validate(data);
}
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(220).email().required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

module.exports.User = User;
module.exports.validate = validateUser;
module.exports.loginValidation = loginValidation;
