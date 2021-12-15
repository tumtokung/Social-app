const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  checkLogin: {
    count: Number,
    delayTime: Number,
  },
  expirePasswordDate: {
    type: Number,
    required: true,
  },
  checkOTP: {
    otp: { type: String, default: '' },
    expireTime: { Number, default: 0 },
  },
  isVerified: { type: Boolean, default: false },
  pic: {
    type: String,
    default:
      'data:image/png;base64,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',
  },
  followers: [{ type: ObjectId, ref: 'User' }],
  following: [{ type: ObjectId, ref: 'User' }],
});

mongoose.model('User', userSchema);
