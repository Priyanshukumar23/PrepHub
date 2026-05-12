🚀 PREPHUB
An AI-Powered Career Preparation & Professional Networking Ecosystem

PREPHUB is a comprehensive platform built using the MERN Stack and the Gemini API. Designed for students, job seekers, and hiring teams, it seamlessly combines AI-driven interview preparation, coding practice, ATS-optimized resume building, and professional networking. The platform incorporates modern DevOps practices, including Docker containerization and Jenkins CI/CD pipelines.

🌟 Key Features
🤖 AI Assessment & Interview Ecosystem
Dynamic Mock Interviews: Real-time, stream-specific questions generated dynamically by Gemini AI based on user input.

Instant AI Feedback: Get deep analysis on logical correctness, code optimization, and communication skills.

AI Coding Practice Panel: Practice Java and C++ directly in the browser. Gemini API evaluates logic correctness, time complexity, and suggests optimized solutions.

🌐 ConnectHub (Professional Networking)
Role-Based Access: Dedicated interfaces for Developers and Hiring Teams.

Real-Time Interaction: Features anonymous global chat and direct messaging powered by Socket.io.

Community Engagement: Share posts, upload media, interact with community content, and build professional profiles.

📄 ATS-Optimized Resume Builder
Dynamic Generation: Create highly optimized, company-ready resumes with real-time previews.

Improved Success Rates: Formatting designed specifically to pass Applicant Tracking Systems (ATS).

🧑‍💼 Job Portal & Admin Panel
Hiring Teams: Create job postings, manage application pipelines, and accept/reject candidates.

Candidates: Browse job boards, track application statuses, and apply seamlessly with their PREPHUB profiles.

🛠️ Tech Stack & Architecture
Frontend

React.js (Vite)

Tailwind CSS

Backend & Integration

Node.js & Express.js (Main API & WebSocket Server)

MongoDB (Database)

AI & Tools

Google Gemini API (LLM for evaluation & feedback)

Socket.io (Real-time communication)

JWT (Authentication)

DevOps & Infrastructure

Docker & Docker Compose (Containerization)

Jenkins (Automated CI/CD pipelines)

📂 Project Structure
Plaintext
PREPHUB/
│
├── client/                  # Frontend React App (Vite + Tailwind)
├── server/                  # Main Backend Node.js/Express Server
├── demo-maven-service/      # Basic Maven assignment integration
├── .github/                 # GitHub repository configurations
├── docker-compose.yml       # Orchestration for multi-container deployment
├── Jenkinsfile              # Jenkins CI/CD pipeline definitions
├── jenkins.war              # Local Jenkins binary for pipeline execution
├── move_files.js            # Build/Deployment utility script
├── Project_Report.md        # Detailed project documentation
└── README.md                # Project overview
🚀 Getting Started
Prerequisites
Node.js (v18+)

Docker & Docker Compose

MongoDB Instance (Local or Atlas)

Gemini API Key
