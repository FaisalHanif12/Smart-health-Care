const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// GET /api/posts
exports.listPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate('user', 'name email')
    .populate('comments.user', 'name')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: posts });
});

// POST /api/posts
exports.createPost = asyncHandler(async (req, res, next) => {
  const { caption } = req.body;
  const file = req.file;
  if (!file) {
    return next(new ErrorResponse('Image is required', 400));
  }
  const imageUrl = `/uploads/${file.filename}`;
  const post = await Post.create({ user: req.user.id, caption, imageUrl });
  const populated = await post.populate('user', 'name email');
  res.status(201).json({ success: true, data: populated });
});

// POST /api/posts/:id/like
exports.toggleLike = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new ErrorResponse('Post not found', 404));
  const userId = req.user.id;
  const idx = post.likes.findIndex((l) => l.toString() === userId);
  if (idx >= 0) {
    post.likes.splice(idx, 1);
  } else {
    post.likes.push(userId);
  }
  await post.save();
  res.status(200).json({ success: true, data: { likes: post.likes } });
});

// POST /api/posts/:id/comments
exports.addComment = asyncHandler(async (req, res, next) => {
  const { text } = req.body;
  if (!text || !text.trim()) return next(new ErrorResponse('Comment text required', 400));
  const post = await Post.findById(req.params.id);
  if (!post) return next(new ErrorResponse('Post not found', 404));
  post.comments.push({ user: req.user.id, text: text.trim() });
  await post.save();
  await post.populate('comments.user', 'name');
  res.status(201).json({ success: true, data: post.comments[post.comments.length - 1] });
});

// DELETE /api/posts/:id
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }
  
  // Check if user owns the post
  if (post.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this post', 401));
  }
  
  // Delete image file if it exists
  if (post.imageUrl) {
    try {
      const imagePath = path.join(__dirname, '..', post.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (err) {
      console.error('Error deleting image file:', err);
      // Continue with post deletion even if image deletion fails
    }
  }
  
  await post.deleteOne();
  
  res.status(200).json({ success: true, data: {} });
});