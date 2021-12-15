const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Log = mongoose.model('Log');
const moment = require('moment');
const dotenv = require('dotenv').config();
router.get('/logs', requireLogin, (req, res) => {
  let Now = new Date(new Date().getTime() + 1000 * 60 * 60 * 7);
  console.log(req.user.email);
  let mysort = { _id: -1 };
  if (req.user.email === process.env.SMTP_USER) {
    Log.find()
      .sort(mysort)
      .then(async (logs) => {
        let newArr = [...logs];
        let updatedData = newArr.map((x) => {
          let timeFromNow = moment(x.time).from(moment(Now));
          return { ...x._doc, timeFromNow };
        });

        // console.log('date', [...updatedData]);
        let updated = [...updatedData];
        res.json({ updated });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ error: err });
      });
  } else {
    return res.status(400).json({ error: "You don't have permission" });
  }
});

module.exports = router;
