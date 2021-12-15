const mailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../keys');
const generateOTP = () => {
  // Declare a digits variable
  // which stores all digits
  var digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 7; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

const sendResetEmail = ({ email, expirePasswordDate }) => {
  // new Date().getTime > expirePasswordDate
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
    to: `${email}`, //to email (require)
    subject: `${'Reset Password'}`, //subject
    html: `<div><h1>Click on the link below to reset your password</h1> <strong><a href = "http://localhost:3000/forgot/${expirePasswordDate}"> HERE </a></strong></div>`, //email body
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
};

const sendOTPEmail = (email, otp) => {
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
    to: `${email}`, //to email (require)
    subject: `${'OTP'}`, //subject
    html: `<div><h1>Your OTP is!!</h1><h2>${otp} </h2></div>`, //email body
  };

  smtpTransport.sendMail(mail, function (err, response) {
    smtpTransport.close();
    if (err) {
      //error handler
      conole.log('Fail to Send Email', err);
    } else {
      //success handler
      console.log('send email success', response);
    }
  });
};
const sendVerifiedEmail = (id, email) => {
  // async email
  jwt.sign(
    {
      id: id,
    },
    JWT_SECRET,
    {
      expiresIn: '1d',
    },
    (err, emailToken) => {
      const url = `http://localhost:5000/confirmation/${emailToken}`;
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
        from: 'no-reply@kaidow.th',
        to: email,
        subject: 'Confirm Email',
        html: `Please click this email to confirm your email: <a href="${url}"><button>Click Here</button></a>`,
      };

      smtpTransport.sendMail(mail, function (err, response) {
        smtpTransport.close();
        if (err) {
          //error handler
          conole.log('Fail to Send Email', err);
        } else {
          //success handler
          console.log('send email success', response);
        }
      });
    }
  );
};

exports.sendVerifiedEmail = sendVerifiedEmail;
exports.generateOTP = generateOTP;
exports.sendOTPEmail = sendOTPEmail;
exports.sendResetEmail = sendResetEmail;
