const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/prephub', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schemas
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true } // In production, hash this password!
});
const User = mongoose.model('User', userSchema);

const historySchema = new mongoose.Schema({
    email: { type: String, required: true },
    action: { type: String, required: true }, // 'login' or 'logout'
    timestamp: { type: Date, default: Date.now }
});
const History = mongoose.model('History', historySchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

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
    const { name, email, password } = req.body;

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
        });

        await newUser.save();
        res.status(201).json({ success: true, user: { id: newUser._id, name: newUser.name, email: newUser.email } });
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

        res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
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
app.post('/api/generate-pdf', (req, res) => {
    const { resumeData } = req.body;

    // In a real application, you would use a library like puppeteer or jsPDF
    // For now, we'll return the data as JSON
    const generatedResume = {
        id: resumeCounter++,
        ...resumeData,
        type: 'generated',
        createdAt: new Date().toISOString()
    };

    resumes.push(generatedResume);
    res.json(generatedResume);
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 