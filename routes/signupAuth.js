const validator = require('validator');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../keys');
const requireLogin = require('../middleware/requireLogin');
const mailer = require('nodemailer');
const {
  generateOTP,
  sendResetEmail,
  sendOTPEmail,
  sendVerifiedEmail,
} = require('./utils/utils');

// check password
router.post('/signup', (req, res) => {
  const { name, email, password, pic } = req.body;
  console.log('Signup', req.body);
  if (!email || !password || !name) {
    return res.status(422).json({ error: 'Please input all fields' });
  }
  if (
    !validator.isStrongPassword(req.body.password, {
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return res.status(422).json({
      error:
        'Password must contain at least one lower-case letter, one upper-case letter, one digit and a special character',
    });
  }

  User.findOne({ email: email, name: name })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({ error: 'User already exists' });
      }
      bcrypt.hash(password, 12).then((hashedPass) => {
        const user = new User({
          email,
          password: hashedPass,
          name,
          checkLogin: {
            count: 0,
            delayTime: new Date().getTime(),
          },
          expirePasswordDate: new Date(
            new Date().getTime() + 1000 * 60 * 60 * 24 * 90
          ),
          pic,
        });
        `  `;
        // console.log('BEFOREUSER : ', user);
        user
          .save()
          .then((user) => {
            const { _id, email } = user;
            res.json({ message: 'User Added', user: user });
            sendVerifiedEmail(_id, email);
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })

    .catch((err) => {
      console.log(err);
    });
});

router.post('/signupverified', (req, res) => {
  const { email } = req.body;
  User.findOne({ email: email }).then((user) => {
    const { _id } = user;
    sendVerifiedEmail(_id, email);
  });
  return res.json({ res: 'success' });
});

router.get('/confirmation/:token', async (req, res) => {
  const { id, exp } = jwt.verify(req.params.token, JWT_SECRET);
  const data = jwt.verify(req.params.token, JWT_SECRET);
  console.log(exp, ':', new Date().getTime());
  // return res.json({ status: user });
  if (new Date().getTime() < exp * 1000) {
    await User.findByIdAndUpdate(id, { isVerified: true }, { new: true }).then(
      (req, err) => {
        if (err) {
          console.log('ERR', err);
        } else {
          email = req.email;
          console.log('Success', req.isVerified);
        }
      }
    );
  } else {
    // sendVerifiedEmail();
    await User.findOne({ _id: id }).then((user) => {
      const { _id, email } = user;
      sendVerifiedEmail(_id, email);
    });
    // console.log('Email', email);
  }

  return res.redirect('http://localhost:3000/login');
});
module.exports = router;
