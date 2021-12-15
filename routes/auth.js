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
const dotenv = require('dotenv').config();
const {
  generateOTP,
  sendResetEmail,
  sendOTPEmail,
  sendVerifiedEmail,
} = require('./utils/utils');
const Log = mongoose.model('Log');
const moment = require('moment');
router.get('/', (req, res) => {
  res.json({ message: process.env.test });
});

router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: 'please add email or password' });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: 'Invalid Email or password' });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          // res.json({message:"successfully signed in"})
          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
          const { _id, name, email, followers, following, pic } = savedUser;
          const log = new Log({
            email,
            event: 'login',
            time: Now,
          });

          log
            .save()
            .then((result) => {
              // res.send({ log: result });
              console.log('login: ', result);
            })
            .catch((err) => {
              console.log('error: ', err);
            });
          res.json({
            token,
            user: { _id, name, email, followers, following, pic },
            message: 'Successfully signin!',
          });
        } else {
          return res.status(422).json({ error: 'Invalid Email or password' });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: 'Please enter email or password' });
  }

  User.findOne({ email: email })
    .then((savedUser) => {
      console.log('saveUser:', savedUser.checkLogin);
      if (!savedUser) {
        return res.status(422).json({ error: 'Email not found' });
      }
      if (!savedUser.isVerified) {
        return res.status(422).json({ error: 'Please Verify Email' });
      }

      if (new Date().getTime() < savedUser.checkLogin.delayTime) {
        console.log(
          (savedUser.checkLogin.delayTime - new Date().getTime()) / 60000
        );
        const waitMin = (
          (savedUser.checkLogin.delayTime - new Date().getTime()) /
          60000
        ).toFixed(2);

        return res.status(422).json({ error: `Please wait ${waitMin} minute` });
      }

      bcrypt.compare(password, savedUser.password).then(async (doMatch) => {
        if (doMatch) {
          console.log('loginSUccess');
          // res.json({ message: 'Signin Successfully' });
          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
          const {
            _id,
            name,
            email,
            checkLogin,
            expirePasswordDate,
            pic,
            followers,
            following,
          } = savedUser;
          const resp = {
            message: 'Successfully Login',
            user: {
              _id,
              name,
              email,
              expirePasswordDate,
              pic,
              followers,
              following,
            },
            token: token,
          };
          User.findByIdAndUpdate(
            savedUser._id,
            {
              checkLogin: {
                count: 0,
                delayTime: new Date().getTime(),
              },
            },
            { new: true },
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                let Now = new Date(new Date().getTime() + 1000 * 60 * 60 * 7);
                // .toISOString()
                // .slice(0, 19)
                // .replace('T', ' ');
                const log = new Log({
                  email,
                  event: 'login',
                  time: Now,
                });

                log
                  .save()
                  .then((result) => {
                    // res.send({ log: result });
                    console.log('login: ', result);
                  })
                  .catch((err) => {
                    console.log('error: ', err);
                  });

                // console.log('Success Login', log);
              }
            }
          );
          // new Date().getTime > expirePasswordDate
          if (new Date().getTime > expirePasswordDate) {
            // password expire
            // send email to path
            // --------------------------------- send email to path
            var smtp = {
              host: 'smtp.gmail.com', //set to your host name or ip
              port: 587, //25, 465, 587 depend on your
              secure: false, // use SSL
              auth: {
                user: process.env.SMTP_USER, //user account
                pass: process.env.SMTP_PASS, //user password
              },
            };
            var smtpTransport = mailer.createTransport(smtp);

            var mail = {
              from: 'no-reply@kaidow.th', //from email (option)
              to: `${savedUser.email}`, //to email (require)
              subject: `${'Reset Password - KDStory'}`, //subject
              html: `<div><h1>Click on the link below to reset your password </h1> <strong><a href = "http://localhost:3000/forgot/${expirePasswordDate}"> HERE </a></strong></div>`, //email body
            };

            smtpTransport.sendMail(mail, function (err, response) {
              smtpTransport.close();
              if (err) {
                //error handler
                conole.log(err);
              } else {
                //success handler
                console.log('send email success', response);
              }
            });

            // --------------------------------- send email to path
            res.json({
              error: 'You password is expired plese check your email',
            });
          } else {
            const newOTP = generateOTP();

            await User.findByIdAndUpdate(
              _id,
              {
                checkOTP: {
                  otp: newOTP,
                  expireTime: new Date().getTime() + 3 * 60000,
                },
              },
              { new: true }
            ).then((res, err) => {
              if (err) {
                console.log('err : ', err);
              } else {
                sendOTPEmail(email, newOTP);
                // res.status(200).json({ data: 'Go vertify' });
              }
            });
            res.json(resp);
          }

          // check expire password 3 time
        } else {
          let lastCount = 1;

          if (savedUser.checkLogin.count >= 3) {
            await User.findByIdAndUpdate(
              savedUser._id,
              {
                checkLogin: {
                  count: 0,
                  delayTime: new Date().getTime() + 5 * 60 * 1000,
                },
              },
              { new: true }
            ).then((err, result) => {
              if (err) {
                console.log(err);
              }
            });

            return res
              .status(422)
              .json({ error: 'Wrong password 4 time.Please wait for 5 min' });
          } else {
            await User.findByIdAndUpdate(
              savedUser._id,
              {
                checkLogin: {
                  count: savedUser.checkLogin.count + 1,
                  delayTime: new Date().getTime(),
                },
              },
              { new: true }
            ).then((res, err) => {
              if (err) {
                console.log('err', err);
              } else {
                lastCount = res.checkLogin.count;
              }
            });
          }

          return res.status(422).json({
            error: `Wrong Username or Password ${lastCount}/4 time`,
          });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ error: 'EMAIL OR PASSWORD INCORRECT' });
    });
});

// --------------Log  Logout-------------------//
router.post('/logout', (req, res) => {
  const { email, event } = req.body;
  let time = new Date(new Date().getTime() + 1000 * 60 * 60 * 7);
  // .toISOString()
  // .slice(0, 19)
  // .replace('T', ' ');
  console.log('time: ', req.body.time);
  const log = new Log({
    email,
    event,
    time,
  });
  console.log('log: ', log);
  log
    .save()
    .then((result) => {
      // res.send({ log: result });

      console.log('logout: ', result);
    })
    .catch((err) => {
      console.log('error: ', err);
    });
});

// --------------forgotpassword -------------------//

router.post('/forgotpassword', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(422).json({ error: 'Please enter email' });
  }

  User.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.status(422).json({ status: 'Email not found' });
    } else {
      console.log('saveUser:', email);
      sendResetEmail(user);
      return res
        .status(200)
        .json({ status: 'Success!! please check yor email inbox' });
    }
  });
});

// -------------- send email to path-------------------//
router.put('/setPassword', (req, res) => {
  const { expirePasswordDate, password } = req.body;
  let resJson = {};
  let err = false;
  console.log('set new = ', { expirePasswordDate, password });
  User.findOne({ expirePasswordDate: req.body.expirePasswordDate })
    .then(async (savedUser) => {
      if (savedUser) {
        let _id = savedUser._id;
        console.log('id = ', _id);
        await bcrypt
          .compare(password, savedUser.password)
          .then(async (doMatch) => {
            if (doMatch) {
              err = true;
              res.json({
                status: 'error',
                info: 'Sorry, your new password must not be the same as your old password. ',
              });
            }
          });
        if (!err) {
          bcrypt.hash(password, 12).then((hashedPass) => {
            console.log('hashedpassword = ', hashedPass);
            User.findByIdAndUpdate(
              _id,
              {
                password: hashedPass,
                expirePasswordDate: new Date(
                  new Date().getTime() + 1000 * 60 * 60 * 24 * 90
                ),
              },
              { new: true }
            ).then((data) => {
              // HERE TUMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM ADD LOG
              let Now = new Date(new Date().getTime() + 1000 * 60 * 60 * 7);
              // .toISOString()
              // .slice(0, 19)
              // .replace('T', ' ');
              const log = new Log({
                email: savedUser.email,
                event: 'Reset Password',
                time: Now,
              });

              log
                .save()
                .then((result) => {
                  // res.send({ log: result });
                  console.log('Reset Login: ', result);
                })
                .catch((err) => {
                  console.log('error: ', err);
                });
              console.log('success');
            });
          });
          res.json({ status: 'success', info: 'successfully' });
        }
      }

      // set new password
      // console.log('saveUser:', savedUser.checkLogin);
      // if (!savedUser) {
      //   return res
      //     .status(422)
      //     .json({ error: 'Username or Password Incorrect' });
      // }
    })
    .catch((err) => {
      console.log(err);
    });
});

//-------verified OTP-----------///

router.post('/verifiedOTP', (req, res) => {
  const { otp, email } = req.body;
  User.findOne({ email: email }).then(async (user) => {
    const token = jwt.sign({ _id: user._id }, JWT_SECRET);
    const {
      _id,
      name,
      email,
      expirePasswordDate,
      checkOTP,
      pic,
      followers,
      following,
    } = user;
    const resp = {
      message: 'Successfully Login',
      user: {
        _id,
        name,
        email,
        expirePasswordDate,
        checkOTP,
        pic,
        followers,
        following,
      },
      token: token,
    };
    // console.log('Date now', new Dae());
    console.log('expireTime', new Date(parseInt(checkOTP.expireTime)));
    if (otp === checkOTP.otp && new Date().getTime() < checkOTP.expireTime) {
      const newOtp = generateOTP();
      await User.findByIdAndUpdate(
        _id,
        { checkOTP: { otp: newOtp, expireTime: new Date().getTime() } },
        { new: true }
      ).then((err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log(res);
        }
      });
      return res.status(200).json(resp);
    } else {
      return res.status(422).json({ err: 'Wrong OTP' });
    }
  });
});
////-----sendOTPAgian-------////
router.post('/sendOTP', (req, res) => {
  const { email } = req.body;
  User.findOne({ email: email }).then(async (user) => {
    const { _id, checkOTP } = user;

    if (checkOTP.expireTime < new Date().getTime()) {
      const newOtp = generateOTP();
      await User.findByIdAndUpdate(
        _id,
        {
          checkOTP: {
            otp: newOtp,
            expireTime: new Date().getTime() + 3 * 60000,
          },
        },
        { new: true }
      ).then((res, err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('OTP', res.checkOTP);
          sendOTPEmail(email, res.checkOTP.otp);
        }
      });

      return res
        .status(200)
        .json({ status: ' Please check OTP in your email' });
    } else {
      const time = (
        (checkOTP.expireTime - new Date().getTime()) /
        (60 * 1000)
      ).toFixed(2);

      return res.status(422).json({ status: `Please wait ${time} minute` });
    }
  });
});

router.post('/register', (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!email || !password || !name) {
    return res.status(422).json({ error: 'please add all the fields' });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res
          .status(422)
          .json({ error: 'user already exists with that email' });
      }
      bcrypt.hash(password, 12).then((hashedpassword) => {
        const user = new User({
          email,
          password: hashedpassword,
          name,
          pic,
        });
        let Now = new Date(new Date().getTime() + 1000 * 60 * 60 * 7);
        user
          .save()
          .then((user) => {
            res.json({ message: 'Signup successfully' });
          })
          .catch((err) => {
            console.log(err);
          });
        const log = new Log({
          email,
          event: 'Signup',
          time: Now,
        });

        log
          .save()
          .then((result) => {
            // res.send({ log: result });
            console.log('login: ', result);
          })
          .catch((err) => {
            console.log('error: ', err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
