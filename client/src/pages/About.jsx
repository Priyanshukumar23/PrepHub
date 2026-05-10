import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -15; // Max 15 degrees tilt
    const rotateY = ((x - centerX) / centerX) * 15;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'radial-gradient(circle at 50% 50%, #1e1b4b, #0f172a)', 
      color: '#f8fafc', 
      perspective: '1500px', 
      padding: '2rem',
      fontFamily: "'Inter', sans-serif"
    }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
         <Link to="/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, fontSize: '1.1rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = '#cbd5e1'}>
           <i className="fas fa-arrow-left"></i> Back to Dashboard
         </Link>
      </nav>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* 3D Container */}
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: 'transform 0.15s ease-out',
            transformStyle: 'preserve-3d',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '2rem',
            padding: '3rem 4rem',
            maxWidth: '900px',
            width: '100%',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(79, 70, 229, 0.2)',
          }}
        >
          {/* Inner Content with Z-translation for 3D Pop */}
          <div style={{ transform: 'translateZ(60px)', transformStyle: 'preserve-3d' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem', transform: 'translateZ(20px)' }}>
              <div style={{ background: 'rgba(79, 70, 229, 0.2)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(79, 70, 229, 0.4)' }}>
                <i className="fas fa-graduation-cap" style={{ fontSize: '3rem', color: '#818cf8' }}></i>
              </div>
              <h1 style={{ fontSize: '3.5rem', margin: 0, fontWeight: 800, background: 'linear-gradient(to right, #818cf8, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                About PrepHub
              </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', transformStyle: 'preserve-3d' }}>
              
              {/* Mission */}
              <div style={{ transform: 'translateZ(40px)', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', margin: '0 0 1rem 0' }}>
                  <i className="fas fa-rocket"></i> Our Mission
                </h3>
                <p style={{ lineHeight: 1.7, color: '#cbd5e1', fontSize: '1.05rem', margin: 0 }}>
                  PrepHub is an all-in-one AI-powered platform designed to bridge the gap between students and their dream careers. We provide smart tools to master coding and ace interviews with confidence.
                </p>
              </div>
              
              {/* How it Works */}
              <div style={{ transform: 'translateZ(40px)', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', margin: '0 0 1rem 0' }}>
                  <i className="fas fa-cogs"></i> How It Works
                </h3>
                <p style={{ lineHeight: 1.7, color: '#cbd5e1', fontSize: '1.05rem', margin: 0 }}>
                  Choose a track (Coding Practice or AI Mock Interview). Submit your solutions and receive real-time, comprehensive evaluations from our integrated Gemini AI engine.
                </p>
              </div>

              {/* Core Features */}
              <div style={{ transform: 'translateZ(50px)', gridColumn: '1 / -1', background: 'rgba(244, 114, 182, 0.05)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(244, 114, 182, 0.2)' }}>
                <h3 style={{ color: '#f472b6', margin: '0 0 1.5rem 0', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className="fas fa-star"></i> Core Features
                </h3>
                <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', listStyle: 'none', padding: 0, margin: 0, color: '#e2e8f0', fontSize: '1.1rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><i className="fas fa-check-circle" style={{ color: '#4ade80' }}></i> Real-time AI Code Evaluation</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><i className="fas fa-check-circle" style={{ color: '#4ade80' }}></i> Dynamic Mock Interviews</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><i className="fas fa-check-circle" style={{ color: '#4ade80' }}></i> Integrated ATS Resume Builder</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><i className="fas fa-check-circle" style={{ color: '#4ade80' }}></i> Job Application Portal</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><i className="fas fa-check-circle" style={{ color: '#4ade80' }}></i> Social Networking (ConnectHub)</li>
                </ul>
              </div>

              {/* Outcomes */}
              <div style={{ transform: 'translateZ(60px)', gridColumn: '1 / -1', textAlign: 'center', marginTop: '1rem', background: 'rgba(251, 191, 36, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                 <h3 style={{ color: '#fbbf24', fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>Outcomes</h3>
                 <p style={{ color: '#fef3c7', fontSize: '1.1rem', margin: 0 }}>Build confidence, refine your technical skills, and land your next big opportunity.</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
