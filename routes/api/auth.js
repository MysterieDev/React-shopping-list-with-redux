const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");
//Item Model
const User = require("../../models/User");

// @route   GET api/auth
// @desc    Auth user
// @access  Public
router.post("/", (req, res) => {
  const { email, password } = req.body;

  //simple Validation
  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields!" });
  }

  //Check for existing user
  User.findOne({ email }).then(user => {
    if (!user) return res.status(400).json({ msg: "User does not exist" });

    //Validate password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (!isMatch) return res.status(400).json({ msg: "invalid credentials" });

      jwt.sign(
        { id: user.id },
        config.get("jwtSecret"),
        { expiresIn: 3600 },
        //Callback
        (err, token) => {
          if (err) throw err;
          res.json({
            //gives token back
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email
            }
          });
        }
      );
    });
  });
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Public
router.get("/user", auth, (req, res) => {
  User.findById(req.user.id)
    //Excludes the password
    .select("-password")
    .then(user => res.json(user));
});

module.exports = router;
