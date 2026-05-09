import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ResumeMaker = () => {
  const [activeTab, setActiveTab] = useState('my-resumes');
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);

  // Form State for Builder
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    jobTitle: '', summary: '', skills: '', address: '',
    template: 'modern'
  });

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser) {
      setUser(loggedInUser);
      fetchResumes();
    }
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resumes');
      const data = await response.json();
      setResumes(data);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchResumes();
        setFile(null);
        alert('Resume uploaded successfully!');
      } else {
        const error = await response.json();
        alert('Upload failed: ' + error.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed due to network error.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchResumes();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveResume = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'builder',
          title: `${formData.firstName} ${formData.lastName} - Resume`,
          data: formData,
          userId: user ? user.id : 'guest'
        })
      });

      if (response.ok) {
        alert('Resume saved successfully!');
        setActiveTab('my-resumes');
        await fetchResumes();
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save resume.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/dashboard" className="nav-back" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-dim)', textDecoration: 'none', marginBottom: '2rem' }}>
        <i className="fas fa-arrow-left" style={{ marginRight: '0.5rem' }}></i> Back to Dashboard
      </Link>

      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Resume Maker</h1>
        <p className="subtitle" style={{ color: 'var(--text-dim)' }}>Create, upload, and manage your professional resumes.</p>
      </header>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('my-resumes')}
          style={{ background: 'transparent', border: 'none', color: activeTab === 'my-resumes' ? 'var(--primary)' : 'white', fontSize: '1.1rem', fontWeight: activeTab === 'my-resumes' ? 'bold' : 'normal', cursor: 'pointer', borderBottom: activeTab === 'my-resumes' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem' }}
        >
          My Resumes
        </button>
        <button 
          onClick={() => setActiveTab('builder')}
          style={{ background: 'transparent', border: 'none', color: activeTab === 'builder' ? 'var(--primary)' : 'white', fontSize: '1.1rem', fontWeight: activeTab === 'builder' ? 'bold' : 'normal', cursor: 'pointer', borderBottom: activeTab === 'builder' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem' }}
        >
          Resume Builder
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '2rem' }}>
        
        {/* My Resumes Tab */}
        {activeTab === 'my-resumes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>Manage Resumes</h2>
            </div>

            {/* Upload Section */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px dashed rgba(255,255,255,0.2)' }}>
              <h3 style={{ marginBottom: '1rem' }}>Upload Existing Resume</h3>
              <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ color: 'white' }} required />
                <button type="submit" className="btn-primary" disabled={uploading} style={{ padding: '0.5rem 1.5rem', borderRadius: '4px', border: 'none', fontWeight: 'bold' }}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </form>
            </div>

            {/* Resume List */}
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Your Documents</h3>
              {resumes.length === 0 ? (
                <p style={{ color: 'var(--text-dim)' }}>No resumes found. Upload one or build a new one!</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {resumes.map(r => (
                    <div key={r.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <i className="fas fa-file-pdf" style={{ fontSize: '2rem', color: '#ef4444' }}></i>
                        <div style={{ overflow: 'hidden' }}>
                          <h4 style={{ margin: 0, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{r.originalName || r.title || 'Untitled Resume'}</h4>
                          <small style={{ color: 'var(--text-dim)' }}>{new Date(r.uploadedAt || r.createdAt).toLocaleDateString()}</small>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(r.filePath || r.type === 'generated') && (
                          <a href={`/api/download/${r.id}`} className="btn-primary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                            <i className="fas fa-download"></i> Download
                          </a>
                        )}
                        <button onClick={() => handleDelete(r.id)} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Builder Tab */}
        {activeTab === 'builder' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
            
            {/* Form Section */}
            <div style={{ background: 'white', color: '#333', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '1.5rem', color: '#4f46e5' }}><i className="fas fa-user"></i> Personal Information</h2>
              <form onSubmit={handleSaveResume} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 500 }}>First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleFormChange} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 500 }}>Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleFormChange} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 500 }}>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleFormChange} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 500 }}>Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 500 }}>Job Title</label>
                  <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleFormChange} placeholder="e.g., Software Engineer" style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 500 }}>Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleFormChange} style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 500 }}>Professional Summary</label>
                  <textarea name="summary" value={formData.summary} onChange={handleFormChange} rows="4" placeholder="Brief summary of your background..." style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px', resize: 'vertical' }}></textarea>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 500 }}>Skills (comma separated)</label>
                  <input type="text" name="skills" value={formData.skills} onChange={handleFormChange} placeholder="React, Node.js, Python..." style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  <button type="submit" style={{ padding: '1rem 2rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', background: '#4f46e5', color: 'white', cursor: 'pointer', width: '100%' }}>
                    <i className="fas fa-save"></i> Save & Generate
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Section */}
            <div style={{ background: 'white', color: '#333', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', position: 'sticky', top: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Live Preview</h3>
                <div>
                  <label style={{ marginRight: '0.5rem', fontWeight: 500 }}>Template:</label>
                  <select name="template" value={formData.template} onChange={handleFormChange} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
              </div>

              {(!formData.firstName && !formData.lastName) ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#999', border: '2px dashed #eee', borderRadius: '8px', fontStyle: 'italic' }}>
                  Start filling out the form to see a live preview of your resume
                </div>
              ) : (
                <div style={{ border: '1px solid #eee', padding: '2rem', borderRadius: '4px', minHeight: '500px', fontFamily: formData.template === 'classic' ? 'serif' : 'sans-serif' }}>
                  <div style={{ borderBottom: formData.template === 'classic' ? '2px solid #333' : 'none', paddingBottom: '1rem', marginBottom: '1rem', textAlign: formData.template === 'creative' ? 'right' : 'left' }}>
                    <h1 style={{ margin: '0 0 0.5rem 0', color: formData.template === 'modern' ? '#4f46e5' : '#333', fontSize: '2.5rem' }}>
                      {formData.firstName} {formData.lastName}
                    </h1>
                    <h2 style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '1.2rem', fontWeight: 'normal' }}>
                      {formData.jobTitle}
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: '#555', fontSize: '0.9rem', justifyContent: formData.template === 'creative' ? 'flex-end' : 'flex-start' }}>
                      {formData.email && <span><i className="fas fa-envelope"></i> {formData.email}</span>}
                      {formData.phone && <span><i className="fas fa-phone"></i> {formData.phone}</span>}
                      {formData.address && <span><i className="fas fa-map-marker-alt"></i> {formData.address}</span>}
                    </div>
                  </div>

                  {formData.summary && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ color: formData.template === 'modern' ? '#4f46e5' : '#333', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Professional Summary</h3>
                      <p style={{ lineHeight: 1.6, color: '#444' }}>{formData.summary}</p>
                    </div>
                  )}

                  {formData.skills && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ color: formData.template === 'modern' ? '#4f46e5' : '#333', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Skills</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {formData.skills.split(',').map((skill, index) => (
                          <span key={index} style={{ background: '#f3f4f6', padding: '0.3rem 0.8rem', borderRadius: '16px', fontSize: '0.9rem', color: '#374151' }}>
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResumeMaker;
