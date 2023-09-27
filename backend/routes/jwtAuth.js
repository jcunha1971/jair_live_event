const router = require("express").Router();
const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");

router.post("/register", validInfo, async (req, res) => {
  try {

    const {
      firstName,
      lastName,
      email,
      username,
      password,
      rePassword
    } = req.body;

    const user = await User.findAll({
      where: {
        username: username
      }
    })

    if (user.length > 0) {
      return res.status(401).json("User already exists");
    }
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound) 

    const [bcryptPassword, bcryptRePassword] = await Promise.all([
      bcrypt.hash(password, salt),
      bcrypt.hash(rePassword, salt)
    ]);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      username,
      password: bcryptPassword,
      rePassword: bcryptRePassword
    });
    const token = jwtGenerator(newUser.id)

    res.json({ token })

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
})

//* Login Route
router.post("/login", validInfo, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findAll({
      where: {
        username: username
      }
    })

    if (user.length === 0) {
      return res.status(401).json("Password or Username is incorrect");
    }
    const validPassword = await bcrypt.compare(password, user[0].password);

    if (!validPassword) {
      return res.status(401).json("Password or Username is incorrect");
    }
    const token = jwtGenerator(user[0].id);

    res.json({ token });

  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error");
  }
});

router.get("/is-verified", authorization, async (req, res) => {
  try {

    res.json(true);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error")
  }
})

module.exports = router;