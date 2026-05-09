import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Network = () => {
  const [userName, setUserName] = useState('Student');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('Aspiring Software Engineer');
  const [userCollege, setUserCollege] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [profileViewers, setProfileViewers] = useState(0);
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState('');
  
  // Profile Dropdown and Edit Modal State
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [inChat, setInChat] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  
  // Apply Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyForm, setApplyForm] = useState({ designation: '', course: '', graduationYear: '', collegeName: '', cvFile: null });

  const chatEndRef = React.useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) {
      fetchProfile(user.email);
      fetchPosts();
      fetchRecommendations(user.email);
      fetchJobs();
      fetchMyApplications(user.id);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    let interval;
    if (inChat) {
      const fetchChat = async () => {
        try {
          const res = await fetch('/api/chat');
          if (res.ok) {
            const data = await res.json();
            setChatMessages(data);
          }
        } catch (err) {
          console.error('Error fetching chat:', err);
        }
      };
      fetchChat();
      interval = setInterval(fetchChat, 2000);
    }
    return () => clearInterval(interval);
  }, [inChat]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, inChat]);

  const fetchProfile = async (email) => {
    try {
      const res = await fetch(`/api/users/profile?email=${email}`);
      if (res.ok) {
        const data = await res.json();
        setUserName(data.name);
        setUserEmail(data.email);
        setUserRole(data.role || 'Aspiring Software Engineer');
        setUserCollege(data.college || '');
        setUserAddress(data.address || '');
      } else {
        // Fallback to local storage if API fails
        const user = JSON.parse(localStorage.getItem('user'));
        setUserName(user.name);
        setUserEmail(user.email);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const fetchRecommendations = async (email) => {
    try {
      const res = await fetch(`/api/users/recommendations?email=${email}`);
      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const fetchMyApplications = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}/applications`);
      const data = await res.json();
      setMyApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const formData = new FormData();
    formData.append('userId', user.id);
    formData.append('designation', applyForm.designation);
    formData.append('course', applyForm.course);
    formData.append('graduationYear', applyForm.graduationYear);
    formData.append('collegeName', applyForm.collegeName);
    formData.append('cvFile', applyForm.cvFile);

    try {
      const res = await fetch(`/api/jobs/${selectedJob._id}/apply`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        alert('Applied successfully!');
        setShowApplyModal(false);
        setApplyForm({ designation: '', course: '', graduationYear: '', collegeName: '', cvFile: null });
        fetchMyApplications(user.id);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to apply');
      }
    } catch (err) {
      console.error('Error applying:', err);
      alert('An error occurred while applying.');
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !postImage) return;
    
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, content: newPost, image: postImage })
      });
      if (res.ok) {
        setNewPost('');
        setPostImage('');
        fetchPosts(); // Refresh feed
      }
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, text: commentText })
      });
      if (res.ok) {
        setCommentText('');
        setActiveCommentPost(null);
        fetchPosts();
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.authorName}`,
        text: post.content,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      if (res.ok) fetchPosts();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const openEditModal = () => {
    setEditName(userName);
    setEditRole(userRole);
    setEditCollege(userCollege);
    setEditAddress(userAddress);
    setShowDropdown(false);
    setShowEditModal(true);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          name: editName,
          role: editRole,
          college: editCollege,
          address: editAddress
        })
      });
      if (res.ok) {
        const data = await res.json();
        setUserName(data.name);
        setUserRole(data.role);
        setUserCollege(data.college);
        setUserAddress(data.address);
        
        // Update local storage
        const user = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({ ...user, name: data.name }));
        
        setShowEditModal(false);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const joinChat = async () => {
    setInChat(true);
    try {
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userName, text: `${userName} joined the chat`, type: 'join' })
      });
    } catch (err) {
      console.error('Error joining chat:', err);
    }
  };

  const leaveChat = async () => {
    setInChat(false);
    try {
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userName, text: `${userName} left the chat`, type: 'leave' })
      });
    } catch (err) {
      console.error('Error leaving chat:', err);
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput('');
    try {
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userName, text, type: 'message' })
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <i className="fas fa-graduation-cap"></i>
          <span>PREPHUB</span>
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-item"><i className="fas fa-home"></i> Dashboard</Link>
          <Link to="/network" className="nav-item active"><i className="fas fa-users"></i> Network</Link>
          <a href="/questions.html" className="nav-item"><i className="fas fa-robot"></i> AI Mock Interview</a>
          <div className="nav-item" onClick={() => setShowChatModal(true)} style={{ cursor: 'pointer' }}><i className="fas fa-comment-dots"></i> Live Chat</div>
        </div>
        <div className="nav-profile">
          <div className="profile-menu" style={{ position: 'relative' }}>
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img src={`https://ui-avatars.com/api/?name=${userName}&background=4F46E5&color=fff`} alt="Profile" className="profile-pic" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="profile-name">{userName} <i className="fas fa-chevron-down text-sm"></i></span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {myApplications.find(app => app.status === 'accepted') ? (
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                      <i className="fas fa-briefcase"></i> Selected in {myApplications.find(app => app.status === 'accepted').jobId?.company}
                    </span>
                  ) : (
                    userEmail
                  )}
                </span>
              </div>
            </div>
            
            {showDropdown && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #eee', width: '200px', zIndex: 100, overflow: 'hidden' }}>
                <div 
                  onClick={openEditModal}
                  style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#374151', fontSize: '0.9rem' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                >
                  <i className="fas fa-user-edit" style={{ width: '16px' }}></i> Edit Profile
                </div>
                <div 
                  onClick={handleLogout}
                  style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#ef4444', fontSize: '0.9rem' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                >
                  <i className="fas fa-sign-out-alt" style={{ width: '16px' }}></i> Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-container" style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start', paddingTop: '2rem' }}>

        {/* Center Column: Feed */}
        <div className="feed-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Create Post */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <img src={`https://ui-avatars.com/api/?name=${userName}&background=4F46E5&color=fff`} alt="Profile" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
              <form onSubmit={handlePostSubmit} style={{ flex: 1 }}>
                <input 
                  type="text" 
                  placeholder="Start a post, share a handwritten note..." 
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  style={{ width: '100%', padding: '1rem 1.5rem', borderRadius: '30px', border: '1px solid #d1d5db', background: '#f3f4f6', outline: 'none', fontSize: '0.95rem' }}
                />
              </form>
            </div>
            {postImage && (
              <div style={{ padding: '0 1.5rem 1rem 1.5rem' }}>
                <img src={postImage} alt="Preview" style={{ width: '100px', height: 'auto', borderRadius: '8px', border: '1px solid #ddd' }} />
                <button onClick={() => setPostImage('')} style={{ display: 'block', marginTop: '0.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>Remove Image</button>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem', padding: '0 1.5rem 1.5rem' }}>
              <input type="file" id="media-upload" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              <button type="button" onClick={() => document.getElementById('media-upload').click()} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                <i className="fas fa-image" style={{ color: '#3b82f6', fontSize: '1.2rem' }}></i> Media
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <hr style={{ flex: 1, borderTop: '1px solid #e5e7eb' }} />
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Sort by: <strong>Top</strong> <i className="fas fa-caret-down"></i></span>
          </div>

          {/* Posts */}
          {posts.map(post => (
            <div key={post._id} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <img src={`https://ui-avatars.com/api/?name=${post.authorName}&background=random`} alt={post.authorName} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                    <div>
                      <h4 style={{ margin: '0 0 0.2rem 0', color: '#1f2937' }}>{post.authorName}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{post.authorRole || 'Member'}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(post.timestamp).toLocaleString()} • <i className="fas fa-globe-americas"></i></p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {post.authorName === userName && (
                      <button onClick={() => handleDeletePost(post._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', transition: 'background 0.2s' }} title="Delete Post" onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'} onMouseOut={(e) => e.currentTarget.style.background = 'none'}>
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    )}
                    <button style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><i className="fas fa-ellipsis-h"></i></button>
                  </div>
                </div>
                
                <p style={{ color: '#374151', lineHeight: '1.6', marginBottom: '1rem' }}>{post.content}</p>
                
                {post.image && (
                  <div style={{ margin: '0 -1.5rem 1rem -1.5rem' }}>
                    <img src={post.image} alt="Post content" style={{ width: '100%', display: 'block' }} />
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                  <span><i className="fas fa-thumbs-up" style={{ color: '#3b82f6' }}></i> <i className="fas fa-heart" style={{ color: '#ef4444' }}></i> {post.likes.length}</span>
                  <span>{post.comments.length} comments</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                  <button onClick={() => handleLike(post._id)} className="post-action-btn" style={{ flex: 1, background: 'none', border: 'none', padding: '0.8rem', color: '#6b7280', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '4px' }}>
                    <i className="far fa-thumbs-up" style={{ fontSize: '1.2rem' }}></i> Like
                  </button>
                  <button onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)} className="post-action-btn" style={{ flex: 1, background: 'none', border: 'none', padding: '0.8rem', color: '#6b7280', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '4px' }}>
                    <i className="far fa-comment" style={{ fontSize: '1.2rem' }}></i> Comment
                  </button>
                  <button onClick={() => handleShare(post)} className="post-action-btn" style={{ flex: 1, background: 'none', border: 'none', padding: '0.8rem', color: '#6b7280', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '4px' }}>
                    <i className="fas fa-share" style={{ fontSize: '1.2rem' }}></i> Share
                  </button>
                </div>
                
                {post.comments && post.comments.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee', background: '#f9fafb', margin: '1rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
                    <h5 style={{ margin: '0 0 0.8rem 0', fontSize: '0.85rem', color: '#4b5563' }}>Comments</h5>
                    {post.comments.map((comment, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.8rem', marginBottom: '0.8rem' }}>
                        <img src={`https://ui-avatars.com/api/?name=${comment.userName}&background=random`} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        <div style={{ background: '#e5e7eb', padding: '0.5rem 0.8rem', borderRadius: '8px', flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1f2937', marginBottom: '0.2rem' }}>{comment.userName}</div>
                          <div style={{ fontSize: '0.85rem', color: '#374151' }}>{comment.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeCommentPost === post._id && (
                  <form onSubmit={(e) => handleAddComment(e, post._id)} style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', padding: '0 1.5rem 1.5rem', borderTop: post.comments && post.comments.length > 0 ? 'none' : '1px solid #eee', paddingTop: post.comments && post.comments.length > 0 ? '0' : '1.5rem' }}>
                    <img src={`https://ui-avatars.com/api/?name=${userName}&background=4F46E5&color=fff`} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                    <input 
                      type="text" 
                      placeholder="Add a comment..." 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      style={{ flex: 1, padding: '0.6rem 1.2rem', borderRadius: '20px', border: '1px solid #d1d5db', background: '#f3f4f6', outline: 'none', fontSize: '0.9rem' }}
                      autoFocus
                    />
                    <button type="submit" disabled={!commentText.trim()} style={{ background: commentText.trim() ? '#4f46e5' : '#9ca3af', color: 'white', border: 'none', padding: '0 1.2rem', borderRadius: '20px', fontWeight: 'bold', cursor: commentText.trim() ? 'pointer' : 'default', fontSize: '0.9rem', transition: 'background 0.2s' }}>Post</button>
                  </form>
                )}
              </div>
            </div>
          ))}
          
        </div>

        {/* Right Column: Recommendations & Jobs */}
        <div className="right-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Notifications for Applications */}
          {myApplications.length > 0 && (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.1rem' }}>Application Status</h3>
              {myApplications.map(app => (
                <div key={app._id} style={{ 
                  marginBottom: '1rem', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  background: app.status === 'accepted' ? '#d1fae5' : app.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
                  border: `1px solid ${app.status === 'accepted' ? '#34d399' : app.status === 'rejected' ? '#f87171' : '#e5e7eb'}`
                }}>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#1f2937', fontSize: '0.9rem' }}>{app.jobId?.title}</h4>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#4b5563' }}>at {app.jobId?.company}</p>
                  
                  {app.status === 'accepted' && (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#065f46', fontWeight: 'bold' }}>
                      <i className="fas fa-check-circle"></i> Congratulations! You got selected for this job role.
                    </p>
                  )}
                  {app.status === 'rejected' && (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#991b1b', fontWeight: 'bold' }}>
                      <i className="fas fa-times-circle"></i> Your application was not selected at this time.
                    </p>
                  )}
                  {app.status === 'pending' && (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
                      <i className="fas fa-clock"></i> Application is pending review.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.1rem' }}>Add to your feed</h3>
            
            {recommendations.length > 0 ? recommendations.slice(0, 3).map(rec => (
              <div key={rec._id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <img src={`https://ui-avatars.com/api/?name=${rec.name}&background=random`} alt={rec.name} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#1f2937', fontSize: '0.9rem' }}>{rec.name}</h4>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#6b7280' }}>{rec.role || 'Member'}</p>
                  <button style={{ background: 'transparent', color: '#4f46e5', border: '1px solid #4f46e5', padding: '0.3rem 1rem', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <i className="fas fa-plus"></i> Connect
                  </button>
                </div>
              </div>
            )) : (
              <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Invite your friends to PrepHub!</p>
            )}
            
            <a href="#" style={{ display: 'block', marginTop: '1rem', color: '#6b7280', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>View all recommendations <i className="fas fa-arrow-right"></i></a>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.1rem' }}>Recommended Jobs</h3>
            
            {jobs.length > 0 ? jobs.slice(0, 5).map(job => (
              <div key={job._id} style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.2rem 0', color: '#1f2937', fontSize: '0.95rem' }}>{job.title}</h4>
                <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: '#4b5563' }}>{job.company}</p>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#6b7280' }}><i className="fas fa-map-marker-alt"></i> {job.location}</p>
                <button onClick={() => handleApplyClick(job)} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Easy Apply
                </button>
              </div>
            )) : (
              <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>No jobs available right now.</p>
            )}
          </div>

        </div>

      </main>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#1f2937' }}>Edit Profile</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>
            
            <form onSubmit={saveProfile}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>Full Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>Designation / Role</label>
                <input 
                  type="text" 
                  value={editRole} 
                  onChange={(e) => setEditRole(e.target.value)}
                  placeholder="e.g. Software Engineer, Student"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>College / University</label>
                <input 
                  type="text" 
                  value={editCollege} 
                  onChange={(e) => setEditCollege(e.target.value)}
                  placeholder="e.g. Stanford University"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>Location / Address</label>
                <input 
                  type="text" 
                  value={editAddress} 
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px', height: '600px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ background: '#4f46e5', padding: '1rem 1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}><i className="fas fa-comment-dots"></i> Community Live Chat</h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {inChat ? (
                  <button onClick={leaveChat} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.4rem 1rem', borderRadius: '16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Leave</button>
                ) : (
                  <button onClick={joinChat} style={{ background: 'white', border: 'none', color: '#4f46e5', padding: '0.4rem 1rem', borderRadius: '16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Join Chat</button>
                )}
                <button onClick={() => setShowChatModal(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.8 }}>&times;</button>
              </div>
            </div>
            
            <div style={{ background: '#fffbeb', borderBottom: '1px solid #fef3c7', padding: '0.75rem 1.5rem', fontSize: '0.85rem', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <i className="fas fa-info-circle" style={{ marginTop: '0.2rem' }}></i>
              <div>
                <strong>Community Guidelines:</strong> Welcome to the Live Chat! Please be respectful to others. Do not use any abusive words, hate speech, or inappropriate language. Violations may result in an immediate ban.
              </div>
            </div>
            
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', background: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!inChat ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', textAlign: 'center' }}>
                  <i className="fas fa-comments" style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                  <p style={{ margin: 0, fontSize: '1rem' }}>Join to chat interactively with others on PrepHub!</p>
                </div>
              ) : (
                <>
                  {chatMessages.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', margin: 'auto' }}>No messages yet. Be the first to say hello!</p>}
                  {chatMessages.map(msg => (
                    <div key={msg.id} style={{ alignSelf: msg.type === 'join' || msg.type === 'leave' ? 'center' : (msg.user === userName ? 'flex-end' : 'flex-start'), maxWidth: '85%' }}>
                      {msg.type === 'join' || msg.type === 'leave' ? (
                        <div style={{ background: '#e5e7eb', padding: '0.3rem 1rem', borderRadius: '16px', fontSize: '0.8rem', color: '#6b7280' }}>
                          {msg.text}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.user === userName ? 'flex-end' : 'flex-start' }}>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.2rem', marginLeft: '0.2rem', marginRight: '0.2rem' }}>{msg.user}</span>
                          <div style={{ background: msg.user === userName ? '#4f46e5' : 'white', color: msg.user === userName ? 'white' : '#1f2937', padding: '0.75rem 1rem', borderRadius: msg.user === userName ? '16px 16px 0 16px' : '16px 16px 16px 0', border: msg.user === userName ? 'none' : '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '0.95rem', wordBreak: 'break-word' }}>
                            {msg.text}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>
            
            {inChat && (
              <form onSubmit={sendChatMessage} style={{ padding: '1rem 1.5rem', borderTop: '1px solid #eee', background: 'white', display: 'flex', gap: '0.8rem' }}>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem 1.2rem', borderRadius: '24px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem' }}
                />
                <button type="submit" style={{ background: '#4f46e5', color: 'white', border: 'none', width: '42px', height: '42px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#4338ca'} onMouseOut={(e) => e.currentTarget.style.background = '#4f46e5'}>
                  <i className="fas fa-paper-plane" style={{ fontSize: '0.9rem', marginLeft: '-2px' }}></i>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Apply Job Modal */}
      {showApplyModal && selectedJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#1f2937' }}>Apply for {selectedJob.title}</h2>
              <button onClick={() => setShowApplyModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>
            
            <form onSubmit={handleApplySubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>Designation</label>
                <input 
                  type="text" 
                  value={applyForm.designation} 
                  onChange={(e) => setApplyForm({...applyForm, designation: e.target.value})}
                  placeholder="e.g. Frontend Developer"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>Course</label>
                <input 
                  type="text" 
                  value={applyForm.course} 
                  onChange={(e) => setApplyForm({...applyForm, course: e.target.value})}
                  placeholder="e.g. BTech, BCA, BBA"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>Graduation Year</label>
                <input 
                  type="number" 
                  value={applyForm.graduationYear} 
                  onChange={(e) => setApplyForm({...applyForm, graduationYear: e.target.value})}
                  placeholder="e.g. 2024"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>College Name</label>
                <input 
                  type="text" 
                  value={applyForm.collegeName} 
                  onChange={(e) => setApplyForm({...applyForm, collegeName: e.target.value})}
                  placeholder="e.g. Stanford University"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>CV / Resume (PDF or DOC)</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setApplyForm({...applyForm, cvFile: e.target.files[0]})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowApplyModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Network;
