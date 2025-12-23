const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Store users in memory
let users = [];
let userCounter = 1;

// Note: In a production environment, you would want to:
// 1. Store images in a cloud storage service (AWS S3, Google Cloud Storage, etc.)
// 2. Use a proper database (MongoDB, PostgreSQL, etc.)
// 3. Implement image compression and optimization
// 4. Add proper image validation and security measures

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Authentication Routes
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }
    
    const newUser = {
        id: userCounter++,
        name,
        email,
        password, // In production, hash this password!
    };
    
    users.push(newUser);
    res.status(201).json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
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