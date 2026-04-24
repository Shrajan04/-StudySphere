import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const Discussion = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [posts, setPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axiosInstance.get('/courses').then(({ data }) => {
      setCourses(data.courses);
      if (data.courses.length > 0) setSelectedCourse(data.courses[0]._id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoadingPosts(true);
    setActivePost(null);
    axiosInstance.get(`/posts?courseId=${selectedCourse}`)
      .then(({ data }) => setPosts(data.posts))
      .catch(() => toast.error('Failed to load posts'))
      .finally(() => setLoadingPosts(false));
  }, [selectedCourse]);

  const loadComments = async (post) => {
    setActivePost(post);
    try {
      const { data } = await axiosInstance.get(`/posts/${post._id}/comments`);
      setComments(data.comments);
    } catch { toast.error('Failed to load comments'); }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/posts', { courseId: selectedCourse, ...newPost });
      toast.success('Post created!');
      setNewPost({ title: '', content: '' });
      setShowPostForm(false);
      const { data } = await axiosInstance.get(`/posts?courseId=${selectedCourse}`);
      setPosts(data.posts);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create post'); }
    finally { setSubmitting(false); }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await axiosInstance.delete(`/posts/${id}`);
      toast.success('Post deleted');
      if (activePost?._id === id) { setActivePost(null); setComments([]); }
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch { toast.error('Failed to delete post'); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activePost) return;
    try {
      await axiosInstance.post(`/posts/${activePost._id}/comments`, { content: newComment });
      setNewComment('');
      const { data } = await axiosInstance.get(`/posts/${activePost._id}/comments`);
      setComments(data.comments);
    } catch { toast.error('Failed to add comment'); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/posts/${activePost._id}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch { toast.error('Failed to delete comment'); }
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Discussion 💬</h1>
          <p className="page-subtitle">Course discussions and Q&amp;A</p>
        </div>
        <button className="btn-primary" onClick={() => setShowPostForm((s) => !s)}>
          {showPostForm ? '✕ Cancel' : '+ New Post'}
        </button>
      </div>

      {/* Course Selector */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="filter-group">
          <label>Course</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} id="discussion-course-filter">
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.courseCode} — {c.courseName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* New Post Form */}
      {showPostForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 className="card-title">New Discussion Post</h3>
          <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Title *</label>
              <input type="text" placeholder="Post title..." value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Content *</label>
              <textarea rows={4} placeholder="What's on your mind?" value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} required />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowPostForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? <span className="spinner-sm" /> : 'Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discussion Layout */}
      <div className="discussion-layout">
        {/* Posts List */}
        <div>
          <h3 style={{ marginBottom: 14, color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {posts.length} Post{posts.length !== 1 ? 's' : ''}
          </h3>
          {loadingPosts ? (
            <div className="page-loading" style={{ minHeight: 120 }}><div className="spinner" /></div>
          ) : posts.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 24px' }}>
              <div className="empty-icon" style={{ fontSize: '2.5rem' }}>💬</div>
              <h3>No posts yet</h3>
              <p>Start the conversation!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {posts.map((post) => (
                <div
                  key={post._id}
                  className={`post-card ${activePost?._id === post._id ? 'active' : ''}`}
                  onClick={() => loadComments(post)}
                >
                  <div className="post-card-author">
                    <span>👤</span> {post.userId?.name || 'Unknown'} · {timeAgo(post.createdAt)}
                    {post.userId?._id === user?._id && (
                      <button
                        className="btn-icon btn-danger"
                        style={{ marginLeft: 'auto', width: 24, height: 24, fontSize: 12 }}
                        onClick={(e) => { e.stopPropagation(); handleDeletePost(post._id); }}
                      >🗑️</button>
                    )}
                  </div>
                  <div className="post-card-title">{post.title}</div>
                  <div className="post-card-preview">{post.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Thread */}
        <div>
          {activePost ? (
            <div className="comment-thread">
              <div className="comment-thread-header">
                <div style={{ fontSize: 15, color: 'var(--text-primary)' }}>{activePost.title}</div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{activePost.content}</p>
              </div>

              <div className="comment-list">
                {comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                    No comments yet — be the first!
                  </div>
                ) : (
                  comments.map((c) => (
                    <div className="comment-bubble" key={c._id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="comment-bubble-author">{c.userId?.name || 'Unknown'}</div>
                        {c.userId?._id === user?._id && (
                          <button
                            className="btn-icon btn-danger"
                            style={{ width: 22, height: 22, fontSize: 11 }}
                            onClick={() => handleDeleteComment(c._id)}
                          >✕</button>
                        )}
                      </div>
                      <div className="comment-bubble-text">{c.content}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{timeAgo(c.createdAt)}</div>
                    </div>
                  ))
                )}
              </div>

              <form className="comment-form" onSubmit={handleAddComment}>
                <input
                  className="comment-input"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn-primary btn-sm">Send</button>
              </form>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>👈</div>
              <p style={{ color: 'var(--text-muted)' }}>Select a post to view comments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discussion;
