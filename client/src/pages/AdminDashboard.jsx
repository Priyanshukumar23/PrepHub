import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', description: '', company: '', location: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.accountType !== 'admin') {
      navigate('/login');
    } else {
      fetchJobs();
      fetchApplications();
    }
  }, [navigate]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data);
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
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newJob, createdBy: user.id })
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

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'white', padding: '1rem 2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h1 style={{ margin: 0, color: '#1f2937' }}>Employer / Admin Dashboard</h1>
          <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Jobs Section */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: '#1f2937' }}>Job Postings</h2>
              <button onClick={() => setShowCreateJob(true)} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                <i className="fas fa-plus"></i> Create Job
              </button>
            </div>

            {jobs.length === 0 && <p style={{ color: '#6b7280' }}>No jobs created yet.</p>}
            
            {jobs.map(job => (
              <div key={job._id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>{job.title}</h3>
                <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563', fontSize: '0.9rem' }}><strong>Company:</strong> {job.company}</p>
                <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563', fontSize: '0.9rem' }}><strong>Location:</strong> {job.location}</p>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>{job.description}</p>
              </div>
            ))}
          </div>

          {/* Applications Section */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>Job Applications</h2>
            
            {applications.length === 0 && <p style={{ color: '#6b7280' }}>No applications received yet.</p>}

            {applications.map(app => (
              <div key={app._id} style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1rem', background: '#f9fafb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>{app.userId?.name} <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 'normal' }}>({app.userId?.email})</span></h3>
                    <p style={{ margin: '0 0 0.2rem 0', color: '#4f46e5', fontWeight: 'bold' }}>Applied for: {app.jobId?.title} at {app.jobId?.company}</p>
                  </div>
                  <div>
                    <span style={{ 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '20px', 
                      fontSize: '0.85rem', 
                      fontWeight: 'bold',
                      background: app.status === 'accepted' ? '#d1fae5' : app.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                      color: app.status === 'accepted' ? '#065f46' : app.status === 'rejected' ? '#991b1b' : '#92400e'
                    }}>
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#4b5563' }}><strong>Designation:</strong> {app.designation}</p>
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#4b5563' }}><strong>Course:</strong> {app.course}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#4b5563' }}><strong>Graduation Year:</strong> {app.graduationYear}</p>
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#4b5563' }}><strong>College:</strong> {app.collegeName}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <a href={`/${app.cvFile.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    <i className="fas fa-file-alt"></i> View CV Document
                  </a>
                </div>

                {app.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                    <button onClick={() => updateApplicationStatus(app._id, 'accepted')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}>
                      Accept Application
                    </button>
                    <button onClick={() => updateApplicationStatus(app._id, 'rejected')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}>
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Job Modal */}
      {showCreateJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#1f2937' }}>Create New Job</h2>
              <button onClick={() => setShowCreateJob(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>
            
            <form onSubmit={handleCreateJob}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>Job Title</label>
                <input 
                  type="text" 
                  value={newJob.title} 
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>Company</label>
                <input 
                  type="text" 
                  value={newJob.company} 
                  onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>Location</label>
                <input 
                  type="text" 
                  value={newJob.location} 
                  onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
                  required
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>Description</label>
                <textarea 
                  value={newJob.description} 
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', minHeight: '100px' }} 
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowCreateJob(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Create Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
