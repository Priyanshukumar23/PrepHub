import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminProfile, setAdminProfile] = useState({ name: '', email: '', role: '' });
  
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', description: '', company: '', location: '' });
  
  // Chat State
  const [activeChatUser, setActiveChatUser] = useState(null); // { email, name }
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.accountType !== 'admin') {
      navigate('/login');
    } else {
      setAdminProfile(user);
      fetchJobs();
      fetchApplications();
    }
  }, [navigate]);

  // Polling for direct messages
  useEffect(() => {
    let interval;
    if (activeChatUser && adminProfile.email) {
      const fetchChat = async () => {
        try {
          const res = await fetch(`/api/messages/${adminProfile.email}/${activeChatUser.email}`);
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
  }, [activeChatUser, adminProfile.email]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChatUser]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      // Only show jobs created by this admin
      const user = JSON.parse(localStorage.getItem('user'));
      setJobs(data.filter(j => j.createdBy === user.id));
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newJob, createdBy: adminProfile.id })
      });
      if (res.ok) {
        setNewJob({ title: '', description: '', company: '', location: '' });
        setShowCreateJob(false);
        fetchJobs();
      }
    } catch (err) {
      console.error('Error creating job:', err);
    }
  };

  const updateApplicationStatus = async (appId, status) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatUser) return;
    const text = chatInput;
    setChatInput('');
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sender: adminProfile.email, 
          recipient: activeChatUser.email, 
          text 
        })
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Compute job stats
  const getJobStats = (jobId) => {
    const jobApps = applications.filter(a => a.jobId?._id === jobId);
    const appliedCount = jobApps.length;
    const selectedCount = jobApps.filter(a => a.status === 'accepted').length;
    return { appliedCount, selectedCount };
  };

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar / Profile Section */}
      <nav style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '1rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <i className="fas fa-briefcase" style={{ fontSize: '1.5rem' }}></i>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>PrepHub Recruiter</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>{adminProfile.name}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Administrator</p>
            </div>
            <img src={`https://ui-avatars.com/api/?name=${adminProfile.name}&background=fff&color=4f46e5`} alt="Admin" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)' }} />
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1300px', margin: '2rem auto', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* Jobs Section */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', fontWeight: 700 }}><i className="fas fa-list-alt" style={{ color: '#4f46e5', marginRight: '0.5rem' }}></i> My Job Postings</h2>
              <button onClick={() => setShowCreateJob(true)} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)' }}>
                <i className="fas fa-plus"></i> New Job
              </button>
            </div>

            {jobs.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0', fontStyle: 'italic' }}>No jobs created yet.</p>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map(job => {
                const stats = getJobStats(job._id);
                return (
                  <div key={job._id} style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s ease', background: '#f8fafc' }} onMouseOver={(e) => e.currentTarget.style.borderColor = '#cbd5e1'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: 600 }}>{job.title}</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><i className="fas fa-building text-gray-400"></i> {job.company}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><i className="fas fa-map-marker-alt text-gray-400"></i> {job.location}</span>
                    </div>
                    
                    {/* Stats Badges */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
                      <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, flex: 1, textAlign: 'center', border: '1px solid #dbeafe' }}>
                        Applied: {stats.appliedCount}
                      </div>
                      <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, flex: 1, textAlign: 'center', border: '1px solid #d1fae5' }}>
                        Selected: {stats.selectedCount}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Applications Section */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.25rem', fontWeight: 700 }}><i className="fas fa-users" style={{ color: '#4f46e5', marginRight: '0.5rem' }}></i> Candidate Applications</h2>
            
            {applications.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem 0', fontStyle: 'italic' }}>No applications received yet.</p>}

            {/* Only show applications for jobs this admin created */}
            {applications.filter(app => jobs.some(j => j._id === app.jobId?._id)).map(app => (
              <div key={app._id} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '1.25rem', background: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={`https://ui-avatars.com/api/?name=${app.userId?.name}&background=random`} alt="Applicant" style={{ width: '52px', height: '52px', borderRadius: '50%', border: '2px solid #f1f5f9' }} />
                    <div>
                      <h3 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: 600 }}>{app.userId?.name}</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{app.userId?.email}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      padding: '0.35rem 1rem', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      background: app.status === 'accepted' ? '#d1fae5' : app.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                      color: app.status === 'accepted' ? '#065f46' : app.status === 'rejected' ? '#991b1b' : '#92400e',
                      display: 'inline-block',
                      marginBottom: '0.5rem',
                      border: `1px solid ${app.status === 'accepted' ? '#10b981' : app.status === 'rejected' ? '#ef4444' : '#f59e0b'}`
                    }}>
                      {app.status.toUpperCase()}
                    </span>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#4f46e5', fontWeight: 600 }}>Role: {app.jobId?.title}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-briefcase text-gray-400"></i> {app.designation}</p>
                    <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-graduation-cap text-gray-400"></i> {app.course}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-calendar-alt text-gray-400"></i> Class of {app.graduationYear}</p>
                    <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-university text-gray-400"></i> {app.collegeName}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <a href={`/${app.cvFile.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '6px', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <i className="fas fa-file-pdf"></i> View Resume
                  </a>
                  
                  {app.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => updateApplicationStatus(app._id, 'rejected')} style={{ background: 'white', color: '#ef4444', border: '1px solid #ef4444', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                        Reject
                      </button>
                      <button onClick={() => updateApplicationStatus(app._id, 'accepted')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }} onMouseOver={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseOut={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                        Accept Candidate
                      </button>
                    </div>
                  )}

                  {/* Chat Button for Accepted Candidates */}
                  {app.status === 'accepted' && (
                    <button 
                      onClick={() => setActiveChatUser({ email: app.userId.email, name: app.userId.name })}
                      style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#4338ca'; e.currentTarget.style.transform = 'translateY(-1px)'; }} 
                      onMouseOut={(e) => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <i className="fas fa-comment-dots"></i> Message Candidate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Chat Modal */}
      {activeChatUser && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '360px', height: '480px', background: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 20px rgba(79, 70, 229, 0.15)', display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {/* Chat Header */}
          <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', color: 'white', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <img src={`https://ui-avatars.com/api/?name=${activeChatUser.name}&background=fff&color=4f46e5`} alt="User" style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#10b981', border: '2px solid #4f46e5', borderRadius: '50%' }}></span>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{activeChatUser.name}</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>Selected Candidate</p>
              </div>
            </div>
            <button onClick={() => { setActiveChatUser(null); setChatMessages([]); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.25rem', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>&times;</button>
          </div>

          {/* Chat Body */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'center', margin: '0.5rem 0 1rem 0' }}>
              <span style={{ background: '#e2e8f0', color: '#475569', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>
                Chat started with {activeChatUser.name}
              </span>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', fontStyle: 'italic' }}>Send instructions for the next interview rounds or onboarding steps.</p>
            </div>

            {chatMessages.map(msg => {
              const isAdmin = msg.sender === adminProfile.email;
              return (
                <div key={msg.id} style={{ alignSelf: isAdmin ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ background: isAdmin ? '#4f46e5' : 'white', color: isAdmin ? 'white' : '#1e293b', padding: '0.75rem 1rem', borderRadius: isAdmin ? '12px 12px 0 12px' : '12px 12px 12px 0', border: isAdmin ? 'none' : '1px solid #e2e8f0', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', wordBreak: 'break-word', lineHeight: 1.4 }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.3rem', textAlign: isAdmin ? 'right' : 'left', marginLeft: '0.3rem', marginRight: '0.3rem' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={sendChatMessage} style={{ padding: '1rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem' }}>
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{ flex: 1, padding: '0.75rem 1.25rem', borderRadius: '24px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', background: '#f1f5f9', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#818cf8'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
              autoFocus
            />
            <button type="submit" disabled={!chatInput.trim()} style={{ background: chatInput.trim() ? '#4f46e5' : '#cbd5e1', color: 'white', border: 'none', width: '42px', height: '42px', borderRadius: '50%', cursor: chatInput.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: chatInput.trim() ? '0 2px 4px rgba(79, 70, 229, 0.3)' : 'none' }}>
              <i className="fas fa-paper-plane" style={{ fontSize: '0.9rem', marginLeft: '-2px' }}></i>
            </button>
          </form>
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '550px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}><i className="fas fa-plus-circle" style={{ color: '#4f46e5', marginRight: '0.5rem' }}></i> Create New Job Post</h2>
              <button onClick={() => setShowCreateJob(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }} onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}>&times;</button>
            </div>
            
            <form onSubmit={handleCreateJob}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Job Title</label>
                <input 
                  type="text" 
                  value={newJob.title} 
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  placeholder="e.g. Senior React Developer"
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} 
                  required
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Company</label>
                <input 
                  type="text" 
                  value={newJob.company} 
                  onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                  placeholder="e.g. Google, TechCorp"
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} 
                  required
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Location</label>
                <input 
                  type="text" 
                  value={newJob.location} 
                  onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                  placeholder="e.g. Remote, San Francisco, CA"
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} 
                  required
                />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Job Description</label>
                <textarea 
                  value={newJob.description} 
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  placeholder="Describe the responsibilities, requirements, and perks..."
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', minHeight: '120px', fontSize: '0.95rem', resize: 'vertical' }} 
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowCreateJob(false)} style={{ padding: '0.85rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.85rem 1.5rem', borderRadius: '8px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)' }}><i className="fas fa-paper-plane"></i> Publish Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
