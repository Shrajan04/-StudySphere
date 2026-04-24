const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPosts, createPost, deletePost,
  getComments, createComment, deleteComment,
} = require('../controllers/postController');

router.use(protect);
router.route('/').get(getPosts).post(createPost);
router.delete('/:id', deletePost);
router.route('/:postId/comments').get(getComments).post(createComment);
router.delete('/:postId/comments/:commentId', deleteComment);

module.exports = router;
