const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const postSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  postedBy: {
    type: ObjectId,
    ref: 'User',
  },
  likes: [{ type: ObjectId, ref: 'User' }],
  comments: [{ text: String, postedBy: { type: ObjectId, ref: 'User' } }],
  datetime: {
    type: Date,
    required: true,
  },
});
mongoose.model('Post', postSchema);
