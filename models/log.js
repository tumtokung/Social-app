const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  event: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
});

mongoose.model('Log', logSchema);
