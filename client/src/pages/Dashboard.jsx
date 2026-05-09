import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';

const Dashboard = () => {
  const [userName, setUserName] = useState('Student');
  const [userEmail, setUserEmail] = useState('');
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0, totalSolved: 0, totalEasy: 0, totalMedium: 0, totalHard: 0, totalQuestions: 0 });
  const navigate = useNavigate();

  // Profile Dropdown and Edit Modal State
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [myApplications, setMyApplications] = useState([]);
  
  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editAddress, setEditAddress] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) {
      setUserName(user.name);
      setUserEmail(user.email);
      fetchProfile(user.email);
      fetchMyApplications(user.id);
      
      // Calculate Stats
      const solvedIds = JSON.parse(localStorage.getItem(`solvedQuestions_${user.email}`)) || [];
      let easy = 0, medium = 0, hard = 0;
      let totalEasy = 0, totalMedium = 0, totalHard = 0;

      questions.forEach(q => {
        if (q.difficulty === 'Easy') totalEasy++;
        else if (q.difficulty === 'Medium') totalMedium++;
        else if (q.difficulty === 'Hard') totalHard++;
      });
      
      solvedIds.forEach(id => {
        const q = questions.find(question => question.id === id);
        if (q) {
          if (q.difficulty === 'Easy') easy++;
          else if (q.difficulty === 'Medium') medium++;
          else if (q.difficulty === 'Hard') hard++;
        }
      });
      
      setStats({ 
        easy, medium, hard, totalSolved: solvedIds.length,
        totalEasy, totalMedium, totalHard, totalQuestions: questions.length 
      });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchProfile = async (email) => {
    try {
      const res = await fetch(`/api/users/profile?email=${email}`);
      if (res.ok) {
        const data = await res.json();
        setUserName(data.name);
        setEditName(data.name);
        setEditRole(data.role || '');
        setEditCollege(data.college || '');
        setEditAddress(data.address || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchMyApplications = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}/applications`);
      if (res.ok) {
        const data = await res.json();
        setMyApplications(data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
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
        
        const user = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({ ...user, name: data.name }));
        
        setShowEditModal(false);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
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
          <Link to="/dashboard" className="nav-item active"><i className="fas fa-home"></i> Dashboard</Link>
          <Link to="/network" className="nav-item"><i className="fas fa-rss"></i> ConnectHub</Link>
          <Link to="/practice" className="nav-item"><i className="fas fa-code"></i> Problem Solving</Link>
          <a href="/questions.html" className="nav-item"><i className="fas fa-robot"></i> AI Mock Interview</a>
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
                  onClick={() => { setShowDropdown(false); setShowEditModal(true); }}
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
      <main className="dashboard-container">
        {/* Welcome Section */}
        <header className="welcome-header">
          <div className="welcome-text">
            <h1>Welcome back, <span>{userName}</span>! 👋</h1>
            <p>Here's what's happening with your interview preparation today.</p>
          </div>
          <a href="/resume_maker.html" className="btn-primary" style={{ textDecoration: 'none' }}>
            <i className="fas fa-file-alt"></i> Resume Maker
          </a>
        </header>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon easy">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-details">
              <h3>Easy</h3>
              <p className="stat-number">{stats.easy} <span>/ {stats.totalEasy}</span></p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon medium">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <div className="stat-details">
              <h3>Medium</h3>
              <p className="stat-number">{stats.medium} <span>/ {stats.totalMedium}</span></p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon hard">
              <i className="fas fa-times-circle"></i>
            </div>
            <div className="stat-details">
              <h3>Hard</h3>
              <p className="stat-number">{stats.hard} <span>/ {stats.totalHard}</span></p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon total">
              <i className="fas fa-fire"></i>
            </div>
            <div className="stat-details">
              <h3>Total Solved</h3>
              <p className="stat-number">{stats.totalSolved} <span>/ {stats.totalQuestions}</span></p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="main-grid">
          {/* Left Column */}
          <div className="left-col">
            <section className="content-card challenge-card">
              <div className="card-header">
                <h2><i className="fas fa-star text-warning"></i> Today's Challenge</h2>
                <span className="tag medium-tag">Medium</span>
              </div>
              <div className="card-body">
                <h3>Reverse Linked List II</h3>
                <p>Given the head of a singly linked list and two integers left and right where left &lt;= right, reverse the nodes of the list from position left to position right, and return the reversed list.</p>
                <div className="challenge-actions">
                  <Link to="/solve/4" className="btn-outline">Solve Now</Link>
                  <span className="success-rate"><i className="fas fa-chart-line"></i> 45% Success Rate</span>
                </div>
              </div>
            </section>

            <section className="content-card">
              <div className="card-header">
                <h2>Recommended for You</h2>
                <Link to="/practice" className="view-all">View All</Link>
              </div>
              <div className="recommendation-list">
                <div className="rec-item">
                  <div className="rec-info">
                    <h4>Two Sum</h4>
                    <span>Array, Hash Table</span>
                  </div>
                  <span className="tag easy-tag">Easy</span>
                </div>
                <div className="rec-item">
                  <div className="rec-info">
                    <h4>Longest Substring Without Repeating Characters</h4>
                    <span>String, Sliding Window</span>
                  </div>
                  <span className="tag medium-tag">Medium</span>
                </div>
                <div className="rec-item">
                  <div className="rec-info">
                    <h4>Merge k Sorted Lists</h4>
                    <span>Linked List, Heap</span>
                  </div>
                  <span className="tag hard-tag">Hard</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="right-col">
            <section className="content-card chat-teaser">
              <div className="card-header">
                <h2>AI Mock Interview</h2>
              </div>
              <div className="chat-preview" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ color: 'var(--text-dim)', marginBottom: '1rem', lineHeight: '1.5' }}>Practice dynamically generated technical questions evaluated by AI in real-time.</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="tag" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>React</span>
                  <span className="tag" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>Node.js</span>
                  <span className="tag" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>System Design</span>
                </div>
              </div>
              <a href="/questions.html" className="btn-primary w-100 mt-3" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Start Interview</a>
            </section>

            <section className="content-card">
              <div className="card-header">
                <h2>Coding Practice</h2>
              </div>
              <div className="chat-preview" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ color: 'var(--text-dim)', marginBottom: '1rem', lineHeight: '1.5' }}>Sharpen your problem-solving skills with hand-picked coding challenges.</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="tag" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>Algorithms</span>
                  <span className="tag" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>Data Structures</span>
                  <span className="tag" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>Logic</span>
                </div>
              </div>
              <Link to="/practice" className="btn-outline w-100 mt-3" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Start Coding</Link>
            </section>
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
    </>
  );
};

export default Dashboard;
