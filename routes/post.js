const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model('Post');

router.get('/allpost', requireLogin, (req, res) => {
  console.log('select all post');
  let mysort = { _id: -1 };
  Post.find()
    .sort(mysort)
    .populate('postedBy', '_id name')
    .populate('comments.postedBy', '_id name')
    .then((posts) => {
      // console.log(posts);
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ error: err });
    });
});
router.get('/getsubpost', requireLogin, (req, res) => {
  console.log('select all post');
  let mysort = { _id: -1 };
  Post.find({ postedBy: { $in: req.user.following } })
    .sort(mysort)
    .populate('postedBy', '_id name')
    .populate('comments.postedBy', '_id name')
    .then((posts) => {
      // console.log(posts);
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ error: err });
    });
});

router.post('/createpost', requireLogin, (req, res) => {
  const { body, img } = req.body;
  console.log('req.body', req.body);
  if (!body || !img) {
    return res.status(422).json({ error: 'Please add all the fields' });
  }
  req.user.password = undefined;
  let Now = new Date(new Date().getTime() + 1000 * 60 * 60 * 7);
  const post = new Post({
    body,
    photo: img,
    postedBy: req.user,
    datetime: Now,
  });
  post
    .save()
    .then((result) => {
      res.json({ post: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/myposts', requireLogin, (req, res) => {
  console.log('get my post', req.user);
  Post.find({ postedBy: req.user._id })
    .populate('postedBy', '_id name')
    .then((mypost) => {
      res.status(200).json({ mypost });
    })
    .catch((err) => {
      console.log(err);
      res.json(401).json({ error: err });
    });
});
router.put('/like', requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .populate('postedBy', '_id name')
    .populate('comments.postedBy', '_id name')
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        console.log('like', result);
        res.json(result);
      }
    });
});
router.put('/unlike', requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .populate('postedBy', '_id name')
    .populate('comments.postedBy', '_id name')
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        console.log('unlike', result);

        res.json(result);
      }
    });
});
router.put('/comment', requireLogin, (req, res) => {
  const comment = {
    text: req.body.text,
    postedBy: req.user._id,
  };
  if (!req.body.text) {
    return res.status(422).json({ message: 'Comment must not empty' });
  }
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate('postedBy', '_id name')
    .populate('comments.postedBy', '_id name')
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
});
router.delete('/deletepost/:postId', requireLogin, (req, res) => {
  Post.findOne({ _id: req.params.postId })
    .populate('postedBy', '_id')
    .exec((err, post) => {
      if (err || !post) {
        return res.status(422).json({ error: err });
      }
      if (post.postedBy._id.toString() === req.user._id.toString()) {
        post
          .remove()
          .then((result) => {
            res.json(result);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
});
module.exports = router;
