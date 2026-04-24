const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Course = require('../models/Course');

// GET /api/posts?courseId=
const getPosts = asyncHandler(async (req, res) => {
  const { courseId } = req.query;
  const query = courseId ? { courseId } : {};
  const posts = await Post.find(query)
    .populate('userId', 'name')
    .populate('courseId', 'courseName courseCode')
    .sort({ createdAt: -1 });
  res.json({ success: true, posts });
});

// POST /api/posts
const createPost = asyncHandler(async (req, res) => {
  const { courseId, title, content } = req.body;
  if (!courseId || !title || !content) {
    res.status(400); throw new Error('courseId, title, and content are required');
  }
  // Verify course ownership
  const course = await Course.findById(courseId);
  if (!course || course.user.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  const post = await Post.create({ userId: req.user._id, courseId, title, content });
  const populated = await post.populate(['userId', 'courseId']);
  res.status(201).json({ success: true, post: populated });
});

// DELETE /api/posts/:id
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) { res.status(404); throw new Error('Post not found'); }
  if (post.userId.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  await Comment.deleteMany({ postId: post._id });
  await post.deleteOne();
  res.json({ success: true, message: 'Post deleted' });
});

// GET /api/posts/:postId/comments
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ postId: req.params.postId })
    .populate('userId', 'name')
    .sort({ createdAt: 1 });
  res.json({ success: true, comments });
});

// POST /api/posts/:postId/comments
const createComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) { res.status(400); throw new Error('Content is required'); }
  const post = await Post.findById(req.params.postId);
  if (!post) { res.status(404); throw new Error('Post not found'); }
  const comment = await Comment.create({ postId: post._id, userId: req.user._id, content });
  const populated = await comment.populate('userId', 'name');
  res.status(201).json({ success: true, comment: populated });
});

// DELETE /api/posts/:postId/comments/:commentId
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }
  if (comment.userId.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  await comment.deleteOne();
  res.json({ success: true, message: 'Comment deleted' });
});

module.exports = { getPosts, createPost, deletePost, getComments, createComment, deleteComment };
