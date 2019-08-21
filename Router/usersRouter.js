const jwt = require("jsonwebtoken");
const config = require("config");
const express = require("express");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const router2 = express.Router();
const auth = require("../Middlewares/authMid");
const Joi = require("joi");
const { Groups } = require("../Database");
const { Users } = require("../Database");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

function validateUser(user) {
  const schema = {
    name: Joi.string()
      .min(3)
      .max(50)
      .required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(1024)
      .required(),
    long: Joi.number(),
    lat: Joi.number()
  };
  return Joi.validate(user, schema);
}

router2.post("/", async (req, res) => {
  //auth,
  const { error } = validateUser(req.body);
  console.log("coming: ", req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await Users.findOne({ where: { email: req.body.email } });
  if (user) return res.status(400).send("User already registered.");

  //console.log(req.body);
  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);
  //console.log(req.body);

  let new_user = await Users.create(req.body);
  //console.log("created: ", new_user);
  const token = jwt.sign(
    {
      id: new_user.id,
      name: new_user.name,
      email: new_user.email
    },
    "myJwtKey"
    // config.get("jwtKey")
  );
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send("Registration Successful !");
});

//returns a list of all users
router2.get("/", async (req, res) => {
  let all = await Users.findAll({ include: [{ model: Groups }] });
  return res.status(200).send(all);
});

//returns a list of all users exluding loged in user
router2.put('/', async (req, res) => {
  let data = req.body.user
  let all = await Users.findAll({
    where: {
      id: {
        [Op.not]: data.id
      }
    }
  });
  return res.status(200).send(all);
})

router2.put('/id', async (req, res) => { //return user by pk
  let all = await Users.findAll({
    where: {
      id : req.body.id
    },
    include: [{
      model: Groups
    }]
  });

  return res.status(200).send(all);
})

module.exports = router2;
