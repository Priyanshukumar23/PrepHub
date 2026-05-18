require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
    try {
        const key = process.env.GEMINI_API_KEY;
        console.log(`[DEBUG] API Key length: ${key ? key.length : 'undefined'}`);
        if (key) {
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key.trim()}`);
            const d = await r.json();
            if (d.models) {
                console.log("[DEBUG] Available Models:", d.models.map(m => m.name).join(", "));
            } else {
                console.log("[DEBUG] Models response:", d);
            }
        }
    } catch(e) {
        console.log("[DEBUG] Model fetch error:", e);
    }
})();

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/prephub';
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB at', mongoURI))
    .catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schemas
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, default: 'Aspiring Software Engineer' },
    role: { type: String, default: 'Student' },
    accountType: { type: String, enum: ['developer', 'admin'], default: 'developer' },
    college: { type: String, default: '' },
    address: { type: String, default: '' },
    profileViewers: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
});
const Job = mongoose.model('Job', jobSchema);

const applicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cvFile: { type: String, required: true },
    designation: { type: String, required: true },
    course: { type: String, required: true },
    graduationYear: { type: String, required: true },
    collegeName: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    timestamp: { type: Date, default: Date.now }
});
const Application = mongoose.model('Application', applicationSchema);

const postSchema = new mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    authorRole: String,
    content: String,
    image: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        text: String,
        timestamp: { type: Date, default: Date.now }
    }],
    timestamp: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

const connectionSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' }
});
const Connection = mongoose.model('Connection', connectionSchema);

const historySchema = new mongoose.Schema({
    email: { type: String, required: true },
    action: { type: String, required: true }, // 'login' or 'logout'
    timestamp: { type: Date, default: Date.now }
});
const History = mongoose.model('History', historySchema);

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MIGRATION LOGIC ---
const srcDir = path.join(__dirname, 'public');
const destDir = path.join(__dirname, 'client', 'public');
if (fs.existsSync(srcDir)) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const filesToKeep = ['questions.html', 'resume_maker.html', 'styles.css', 'hub.css', 'script.js', 'editor.js'];
  filesToKeep.forEach(file => {
    const srcFile = path.join(srcDir, file);
    if (fs.existsSync(srcFile)) fs.renameSync(srcFile, path.join(destDir, file));
  });
  fs.rmSync(srcDir, { recursive: true, force: true });
  console.log('Migrated essential files to client/public and deleted old public directory.');
}
// -----------------------

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/msword' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and Word documents are allowed'));
        }
    }
});

// Store resumes in memory (in production, use a database)
let resumes = [];
let resumeCounter = 1;

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Authentication Routes
app.post('/api/register', async (req, res) => {
    const { name, email, password, accountType } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = new User({
            name,
            email,
            password, // In production, hash this password!
            accountType: accountType || 'developer'
        });

        await newUser.save();
        res.status(201).json({ success: true, user: { id: newUser._id, name: newUser.name, email: newUser.email, accountType: newUser.accountType } });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Log login history
        await History.create({
            email: user.email,
            action: 'login'
        });

        res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, accountType: user.accountType } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/logout', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required for logging out' });
    }

    try {
        // Log logout history
        await History.create({
            email,
            action: 'logout'
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout logging failed' });
    }
});

// --- Job & Application Routes ---
app.post('/api/jobs', async (req, res) => {
    const { title, description, company, location, createdBy } = req.body;
    try {
        const newJob = new Job({ title, description, company, location, createdBy });
        await newJob.save();
        res.status(201).json(newJob);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create job' });
    }
});

app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ timestamp: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

app.post('/api/jobs/:id/apply', upload.single('cvFile'), async (req, res) => {
    const { userId, designation, course, graduationYear, collegeName } = req.body;
    const jobId = req.params.id;

    if (!req.file) {
        return res.status(400).json({ error: 'CV file is required' });
    }

    try {
        const existingApplication = await Application.findOne({ jobId, userId });
        if (existingApplication) {
            return res.status(400).json({ error: 'You have already applied for this job' });
        }

        const application = new Application({
            jobId,
            userId,
            cvFile: req.file.path,
            designation,
            course,
            graduationYear,
            collegeName
        });
        await application.save();
        res.status(201).json({ success: true, application });
    } catch (error) {
        console.error('Application error:', error);
        res.status(500).json({ error: 'Failed to apply for job' });
    }
});

app.get('/api/applications', async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('jobId', 'title company location')
            .populate('userId', 'name email')
            .sort({ timestamp: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

app.get('/api/users/:userId/applications', async (req, res) => {
    try {
        const applications = await Application.find({ userId: req.params.userId })
            .populate('jobId', 'title company location')
            .sort({ timestamp: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user applications' });
    }
});

app.put('/api/applications/:id/status', async (req, res) => {
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('jobId');
        
        if (!application) return res.status(404).json({ error: 'Application not found' });

        if (status === 'accepted') {
            const newRole = `${application.designation} at ${application.jobId.company}`;
            await User.findByIdAndUpdate(application.userId, { role: newRole });
        }
        
        res.json(application);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update application status' });
    }
});


// Get all resumes
app.get('/api/resumes', (req, res) => {
    res.json(resumes);
});

// Get a specific resume
app.get('/api/resumes/:id', (req, res) => {
    const resume = resumes.find(r => r.id === parseInt(req.params.id));
    if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
    }
    res.json(resume);
});

// Create a new resume
app.post('/api/resumes', (req, res) => {
    const newResume = {
        id: resumeCounter++,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    resumes.push(newResume);
    res.status(201).json(newResume);
});

// Update a resume
app.put('/api/resumes/:id', (req, res) => {
    const resumeIndex = resumes.findIndex(r => r.id === parseInt(req.params.id));
    if (resumeIndex === -1) {
        return res.status(404).json({ error: 'Resume not found' });
    }

    resumes[resumeIndex] = {
        ...resumes[resumeIndex],
        ...req.body,
        updatedAt: new Date().toISOString()
    };

    res.json(resumes[resumeIndex]);
});

// Delete a resume
app.delete('/api/resumes/:id', (req, res) => {
    const resumeIndex = resumes.findIndex(r => r.id === parseInt(req.params.id));
    if (resumeIndex === -1) {
        return res.status(404).json({ error: 'Resume not found' });
    }

    resumes.splice(resumeIndex, 1);
    res.status(204).send();
});

// Upload resume file
app.post('/api/upload', upload.single('resume'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedResume = {
        id: resumeCounter++,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        uploadedAt: new Date().toISOString()
    };

    resumes.push(uploadedResume);
    res.json(uploadedResume);
});

// Download resume file
app.get('/api/download/:id', (req, res) => {
    const resume = resumes.find(r => r.id === parseInt(req.params.id));
    if (!resume || !resume.filePath) {
        return res.status(404).json({ error: 'Resume not found' });
    }

    const filePath = path.join(__dirname, resume.filePath);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, resume.originalName);
});

// Generate PDF resume
app.post('/api/resume/download', async (req, res) => {
    try {
        const userHtml = req.body.html; // The HTML from your React frontend

        // Call your amazing new Java Microservice!
        let response;
        try {
            response = await axios.post('http://pdf-maven-service:8080/generate-pdf', userHtml, {
                headers: { 'Content-Type': 'text/html' },
                responseType: 'arraybuffer' // We are expecting a binary PDF file back
            });
        } catch (dockerErr) {
            // If we cannot resolve pdf-maven-service (ENOTFOUND) or connection is refused (ECONNREFUSED),
            // it means we might be running the server locally outside Docker. Try localhost.
            if (dockerErr.code === 'ENOTFOUND' || dockerErr.code === 'ECONNREFUSED') {
                console.log("[PDF Service] Failed to connect to pdf-maven-service inside docker. Trying local fallback (localhost:8082)...");
                response = await axios.post('http://localhost:8082/generate-pdf', userHtml, {
                    headers: { 'Content-Type': 'text/html' },
                    responseType: 'arraybuffer'
                });
            } else {
                throw dockerErr;
            }
        }

        // Send the PDF directly to the React frontend to download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
        res.send(response.data);

    } catch (error) {
        console.error("Failed to generate PDF:", error.message);
        res.status(500).json({ error: "PDF generation failed" });
    }
});

// Evaluate code using Gemini API
app.post('/api/evaluate-code', async (req, res) => {
    const { code, language, question } = req.body;

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your environment variables.' });
    }

    const prompt = `You are an expert programming evaluator. The user has submitted a solution for a coding problem.

Problem Title: ${question.title}
Problem Description: ${question.description}
Examples: ${JSON.stringify(question.examples)}

Language: ${language}
Code:
${code}

Please evaluate the code.
1. Check for syntax errors and logical bugs.
2. Verify if it correctly solves the problem described and handles the examples.
3. Suggest optimizations (time/space complexity).

Provide your response STRICTLY as a JSON object with the following structure (do not use markdown formatting like markdown json blocks):
{
  "passed": true or false, // true only if the code is completely correct and optimal
  "feedback": "Detailed feedback. If failed, explain the errors or logic issues. If passed, provide the time/space complexity and any optimization suggestions.",
  "idealCode": "A full, working implementation in the chosen language that correctly and optimally solves the problem. Keep this clean, without markdown formatting."
}
`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Gemini API HTTP Error:', data.error);
            return res.status(500).json({ error: 'HTTP Error from Gemini API: ' + (data.error ? data.error.message : response.statusText) });
        }
        if (data.error) {
            console.error('Gemini API Response Error:', data.error);
            return res.status(500).json({ error: 'Response Error from Gemini API: ' + data.error.message });
        }

        const textResponse = data.candidates[0].content.parts[0].text;
        
        // Clean up markdown if the model accidentally included it
        const cleanedText = textResponse.replace(/```json\n?|\n?```/g, '').trim();
        
        try {
            const result = JSON.parse(cleanedText);
            res.json(result);
        } catch (parseError) {
            console.error('Error parsing Gemini response:', cleanedText);
            res.status(500).json({ error: 'Failed to parse evaluation response from AI.' });
        }

    } catch (error) {
        console.error('Code evaluation error:', error);
        res.status(500).json({ error: 'Failed to evaluate code' });
    }
});

// Generate Interview Question
app.post('/api/generate-question', async (req, res) => {
    const { category, level, previousQuestions } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const prevList = previousQuestions && previousQuestions.length > 0 
        ? `Do NOT ask these previous questions: ${previousQuestions.join(', ')}` 
        : '';

    const prompt = `You are a technical interviewer. The candidate is interviewing for a role in "${category}".
The requested difficulty level is "${level}".
${prevList}

Generate exactly ONE technical or conceptual interview question appropriate for this category and level.
Do NOT provide the answer. ONLY provide the question text. Keep it concise but clear.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Gemini API Error details:', data.error);
            return res.status(500).json({ error: 'Google API Error: ' + (data.error ? data.error.message : response.statusText) });
        }
        if (data.error) return res.status(500).json({ error: data.error.message });

        const questionText = data.candidates[0].content.parts[0].text.trim();
        res.json({ question: questionText });
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Failed to generate question: ' + error.message });
    }
});

// Evaluate Interview Answer
app.post('/api/evaluate-answer', async (req, res) => {
    const { category, question, answer } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `You are a technical interviewer evaluating a candidate for a "${category}" role.
Question asked: "${question}"
Candidate's answer: "${answer}"

Evaluate the candidate's answer.
1. Determine if the answer is fundamentally correct (isCorrect: true/false).
2. Provide constructive feedback on what they did well and what they missed.
3. Provide an "optimized" or "ideal" answer to the question.

Provide your response STRICTLY as a JSON object with this structure (no markdown formatting like markdown json blocks):
{
  "isCorrect": true or false,
  "feedback": "Your evaluation feedback",
  "idealAnswer": "The ideal, optimized answer to the question"
}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Gemini API Error details:', data.error);
            return res.status(500).json({ error: 'Google API Error: ' + (data.error ? data.error.message : response.statusText) });
        }
        if (data.error) return res.status(500).json({ error: data.error.message });

        const textResponse = data.candidates[0].content.parts[0].text;
        const cleanedText = textResponse.replace(/```json\n?|\n?```/g, '').trim();
        
        try {
            const result = JSON.parse(cleanedText);
            res.json(result);
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse AI evaluation.' });
        }
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Failed to evaluate answer: ' + error.message });
    }
});

// --- Chat & Real-Time Polling Logic ---
const badWords = ['badword', 'abuse', 'hate', 'stupid', 'idiot']; // Basic filter
const filterMessage = (msg) => {
    let filtered = msg;
    badWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filtered = filtered.replace(regex, '***');
    });
    return filtered;
};

let chatMessages = []; // In-memory store for chat messages

app.get('/api/chat', (req, res) => {
    // Send last 50 messages
    res.json(chatMessages.slice(-50));
});

app.post('/api/chat/message', (req, res) => {
    const { user, text, type } = req.body;
    const msg = {
        id: Date.now(),
        user: user || 'Anonymous',
        text: type === 'message' ? filterMessage(text) : text,
        type: type || 'message', // 'message', 'join', 'leave'
        timestamp: new Date()
    };
    chatMessages.push(msg);
    // Keep only last 100 messages in memory
    if (chatMessages.length > 100) chatMessages.shift();
    res.status(201).json(msg);
});

let directMessages = []; // Store for admin-user direct messages

app.get('/api/messages/:user1/:user2', (req, res) => {
    const { user1, user2 } = req.params;
    const msgs = directMessages.filter(m => 
        (m.sender === user1 && m.recipient === user2) || 
        (m.sender === user2 && m.recipient === user1)
    );
    res.json(msgs.slice(-50));
});

app.post('/api/messages', (req, res) => {
    const { sender, recipient, text } = req.body;
    const msg = {
        id: Date.now(),
        sender,
        recipient,
        text,
        timestamp: new Date()
    };
    directMessages.push(msg);
    if (directMessages.length > 1000) directMessages.shift();
    res.status(201).json(msg);
});

// --- Network / Social Features API ---
// Get all posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ timestamp: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Create a post
app.post('/api/posts', async (req, res) => {
    try {
        const { email, content, image } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const newPost = new Post({
            authorId: user._id,
            authorName: user.name,
            authorRole: user.role,
            content,
            image
        });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Like a post
app.post('/api/posts/:id/like', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const likeIndex = post.likes.indexOf(user._id);
        if (likeIndex === -1) {
            post.likes.push(user._id);
        } else {
            post.likes.splice(likeIndex, 1);
        }
        await post.save();
        res.json({ likes: post.likes.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to like post' });
    }
});

// Comment on a post
app.post('/api/posts/:id/comment', async (req, res) => {
    try {
        const { email, text } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const comment = { userId: user._id, userName: user.name, text };
        post.comments.push(comment);
        await post.save();
        res.status(201).json(post.comments);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Delete a post
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        
        // Find and delete
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Get user recommendations (all other users)
app.get('/api/users/recommendations', async (req, res) => {
    try {
        const email = req.query.email;
        const users = await User.find({ email: { $ne: email } }, 'name role _id');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// Update Profile
app.put('/api/users/profile', async (req, res) => {
    try {
        const { email, name, role, college, address } = req.body;
        const user = await User.findOneAndUpdate(
            { email },
            { name, role, college, address },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({
            name: user.name,
            email: user.email,
            role: user.role,
            college: user.college,
            address: user.address
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get Profile
app.get('/api/users/profile', async (req, res) => {
    try {
        const { email } = req.query;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({
            name: user.name,
            email: user.email,
            role: user.role,
            college: user.college,
            address: user.address
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 