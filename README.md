# Resume Maker Website

A modern, responsive resume builder website built with HTML, CSS, JavaScript, and Node.js. Create professional resumes with multiple templates, edit existing ones, and download them in various formats.

## Features

### ✨ Resume Builder
- **Interactive Form**: Easy-to-use form with real-time preview
- **Multiple Sections**: Personal info, education, experience, skills, projects, and certifications
- **Dynamic Fields**: Add/remove education, experience, projects, and certifications as needed
- **Live Preview**: See your resume take shape in real-time as you type

### 🎨 Multiple Templates
- **Modern Template**: Clean and professional design
- **Classic Template**: Traditional and formal layout
- **Creative Template**: Modern and innovative design
- **Template Switching**: Change templates on the fly

### 💾 Resume Management
- **Save & Load**: Save your resumes and load them later for editing
- **File Upload**: Upload existing resume files (PDF, DOC, DOCX)
- **Edit Existing**: Modify previously created resumes
- **Delete Resumes**: Remove resumes you no longer need

### 📱 Responsive Design
- **Mobile-First**: Optimized for all device sizes
- **Modern UI**: Beautiful gradients, shadows, and animations
- **Accessible**: Clean, readable typography and intuitive navigation

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **File Handling**: Multer for file uploads
- **Styling**: Custom CSS with modern design principles
- **Icons**: Font Awesome for beautiful icons
- **Fonts**: Inter font family for excellent readability

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd resume-maker
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Step 4: Access the Application
Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
resume-maker/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── script.js          # JavaScript functionality
├── uploads/               # Uploaded resume files
├── server.js              # Node.js server
├── package.json           # Project dependencies
└── README.md             # Project documentation
```

## API Endpoints

### Resume Management
- `GET /api/resumes` - Get all resumes
- `GET /api/resumes/:id` - Get specific resume
- `POST /api/resumes` - Create new resume
- `PUT /api/resumes/:id` - Update existing resume
- `DELETE /api/resumes/:id` - Delete resume

### File Operations
- `POST /api/upload` - Upload resume file
- `GET /api/download/:id` - Download resume file
- `POST /api/generate-pdf` - Generate PDF resume

## Usage Guide

### Creating a New Resume
1. Navigate to the "Resume Builder" tab
2. Fill in your personal information
3. Add education details
4. Include work experience
5. List your skills
6. Add projects and certifications
7. Choose a template style
8. Save your resume

### Editing an Existing Resume
1. Go to "My Resumes" tab
2. Click "Edit" on the resume you want to modify
3. Make your changes
4. Save the updated resume

### Uploading an Existing Resume
1. Navigate to "My Resumes" tab
2. Click "Upload Resume"
3. Select your file (PDF, DOC, DOCX)
4. Upload and manage your resume

### Downloading Your Resume
1. In the Resume Builder, click "Generate & Download"
2. Your resume will be downloaded as an HTML file
3. Open in any web browser or convert to PDF

## Customization

### Adding New Templates
1. Create a new template function in `script.js`
2. Add the template option to the HTML select element
3. Style the template in `styles.css`

### Modifying Styles
- Edit `public/styles.css` to change colors, fonts, and layout
- Use CSS variables for consistent theming
- Modify the responsive breakpoints as needed

### Adding New Fields
1. Add HTML form elements in `index.html`
2. Update the JavaScript data collection functions
3. Modify the template generators to display new fields

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Features

- **Lazy Loading**: Templates and sections load as needed
- **Efficient DOM Updates**: Minimal re-rendering for smooth performance
- **Optimized CSS**: Efficient selectors and minimal repaints
- **Responsive Images**: Optimized for different screen densities

## Security Features

- **File Type Validation**: Only allows safe file types
- **Input Sanitization**: Prevents XSS attacks
- **CORS Protection**: Secure cross-origin requests
- **Error Handling**: Graceful error handling and user feedback

## Future Enhancements

- [ ] PDF generation with jsPDF or Puppeteer
- [ ] More resume templates
- [ ] Resume sharing and collaboration
- [ ] Cloud storage integration
- [ ] Resume analytics and tracking
- [ ] Multi-language support
- [ ] Advanced formatting options
- [ ] Resume scoring and suggestions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:
- Check the browser console for error messages
- Ensure all dependencies are properly installed
- Verify Node.js version compatibility
- Check that the server is running on the correct port

## Acknowledgments

- Font Awesome for the beautiful icons
- Google Fonts for the Inter font family
- The open-source community for inspiration and tools

---

**Happy Resume Building! 🚀** 