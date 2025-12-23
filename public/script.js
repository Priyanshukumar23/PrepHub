// Global variables
let currentTemplate = 'modern';
let currentResumeId = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupTabNavigation();
    setupFormEventListeners();
    setupModalEventListeners();
    setupImageUpload();
    loadResumes();
    updatePreview();
}

// Tab Navigation
function setupTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active tab
            tabContents.forEach(tab => tab.classList.remove('active'));
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Form Event Listeners
function setupFormEventListeners() {
    const resumeForm = document.getElementById('resumeForm');
    const fileUploadForm = document.getElementById('fileUploadForm');

    if (resumeForm) {
        resumeForm.addEventListener('submit', handleResumeSubmit);
        
        // Add real-time preview updates
        const formInputs = resumeForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', updatePreview);
        });
    }

    if (fileUploadForm) {
        fileUploadForm.addEventListener('submit', handleFileUpload);
    }
}

// Modal Event Listeners
function setupModalEventListeners() {
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// Image Upload Setup
function setupImageUpload() {
    const profileImageInput = document.getElementById('profileImage');
    const imagePreview = document.getElementById('imagePreview');
    
    if (profileImageInput && imagePreview) {
        profileImageInput.addEventListener('change', handleImageUpload);
        imagePreview.addEventListener('click', () => profileImageInput.click());
    }
}

// Handle Image Upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        return;
    }
    
    // Compress image before displaying
    compressImage(file, function(compressedData) {
        displayProfileImage(compressedData);
        showNotification('Profile image uploaded and compressed successfully!', 'success');
    });
}

// Compress image to reduce file size
function compressImage(file, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        // Set canvas dimensions (max 300x300 for profile picture)
        const maxSize = 300;
        let { width, height } = img;
        
        if (width > height) {
            if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with quality 0.8 (80%)
        const compressedData = canvas.toDataURL('image/jpeg', 0.8);
        callback(compressedData);
    };
    
    img.src = URL.createObjectURL(file);
}

// Display Profile Image
function displayProfileImage(imageData) {
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');
    
    if (imagePreview) {
        imagePreview.innerHTML = `<img src="${imageData}" alt="Profile Picture" onerror="this.style.display='none'">`;
        imagePreview.classList.add('has-image');
        removeImageBtn.style.display = 'inline-flex';
    }
    
    // Store image data for form submission
    window.profileImageData = imageData;
    
    // Update preview
    updatePreview();
}

// Remove Profile Image
function removeProfileImage() {
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const profileImageInput = document.getElementById('profileImage');
    
    if (imagePreview) {
        imagePreview.innerHTML = `
            <i class="fas fa-user-circle"></i>
            <span>Click to upload image</span>
        `;
        imagePreview.classList.remove('has-image');
        removeImageBtn.style.display = 'none';
    }
    
    if (profileImageInput) {
        profileImageInput.value = '';
    }
    
    // Clear stored image data
    window.profileImageData = null;
    
    // Update preview
    updatePreview();
}

// Handle Resume Form Submit
async function handleResumeSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const resumeData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        jobTitle: formData.get('jobTitle'),
        address: formData.get('address'),
        linkedin: formData.get('linkedin'),
        github: formData.get('github'),
        summary: formData.get('summary'),
        profileImage: window.profileImageData || null,
        education: getEducationData(),
        experience: getExperienceData(),
        skills: formData.get('skills'),
        activities: getActivitiesData(),
        achievements: getAchievementsData(),
        projects: getProjectsData(),
        certifications: getCertificationsData()
    };

    try {
        if (currentResumeId) {
            // Update existing resume
            const response = await fetch(`/api/resumes/${currentResumeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resumeData)
            });
            
            if (response.ok) {
                showNotification('Resume updated successfully!', 'success');
                loadResumes();
            }
        } else {
            // Create new resume
            const response = await fetch('/api/resumes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resumeData)
            });
            
            if (response.ok) {
                const newResume = await response.json();
                currentResumeId = newResume.id;
                showNotification('Resume saved successfully!', 'success');
                loadResumes();
            }
        }
    } catch (error) {
        console.error('Error saving resume:', error);
        showNotification('Error saving resume. Please try again.', 'error');
    }
}

// Handle File Upload
async function handleFileUpload(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            showNotification('Resume uploaded successfully!', 'success');
            loadResumes();
            hideUploadForm();
            e.target.reset();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Error uploading resume', 'error');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        showNotification('Error uploading resume. Please try again.', 'error');
    }
}

// Get Form Data Functions
function getEducationData() {
    // Get X and XII class data
    const xClassData = {
        board: document.querySelector('input[name="xBoard"]')?.value || '',
        school: document.querySelector('input[name="xSchool"]')?.value || '',
        year: document.querySelector('input[name="xYear"]')?.value || '',
        percentage: document.querySelector('input[name="xPercentage"]')?.value || ''
    };
    
    const xiiClassData = {
        board: document.querySelector('input[name="xiiBoard"]')?.value || '',
        school: document.querySelector('input[name="xiiSchool"]')?.value || '',
        year: document.querySelector('input[name="xiiYear"]')?.value || '',
        percentage: document.querySelector('input[name="xiiPercentage"]')?.value || '',
        stream: document.querySelector('input[name="xiiStream"]')?.value || ''
    };
    
    // Get higher education data
    const educationItems = document.querySelectorAll('#higherEducationContainer .education-item');
    const higherEducation = [];
    
    educationItems.forEach(item => {
        const inputs = item.querySelectorAll('input');
        if (inputs[0].value.trim()) {
            higherEducation.push({
                degree: inputs[0].value,
                fieldOfStudy: inputs[1].value,
                institution: inputs[2].value,
                graduationYear: inputs[3].value,
                gpa: inputs[4].value
            });
        }
    });
    
    return {
        xClass: xClassData,
        xiiClass: xiiClassData,
        higherEducation: higherEducation
    };
}

function getExperienceData() {
    const experienceItems = document.querySelectorAll('.experience-item');
    const experience = [];
    
    experienceItems.forEach(item => {
        const inputs = item.querySelectorAll('input, textarea');
        if (inputs[0].value.trim()) {
            experience.push({
                jobTitle: inputs[0].value,
                company: inputs[1].value,
                startDate: inputs[2].value,
                endDate: inputs[3].value,
                description: inputs[4].value
            });
        }
    });
    
    return experience;
}

function getProjectsData() {
    const projectItems = document.querySelectorAll('.project-item');
    const projects = [];
    
    projectItems.forEach(item => {
        const inputs = item.querySelectorAll('input, textarea');
        if (inputs[0].value.trim()) {
            projects.push({
                name: inputs[0].value,
                technologies: inputs[1].value,
                description: inputs[2].value,
                url: inputs[3].value
            });
        }
    });
    
    return projects;
}

function getCertificationsData() {
    const certificationItems = document.querySelectorAll('.certification-item');
    const certifications = [];
    
    certificationItems.forEach(item => {
        const inputs = item.querySelectorAll('input');
        if (inputs[0].value.trim()) {
            certifications.push({
                name: inputs[0].value,
                organization: inputs[1].value,
                issueDate: inputs[2].value,
                expiryDate: inputs[3].value
            });
        }
    });
    
    return certifications;
}

// Get Activities Data
function getActivitiesData() {
    const activityItems = document.querySelectorAll('.activity-item');
    const activities = [];
    
    activityItems.forEach(item => {
        const inputs = item.querySelectorAll('input, textarea');
        if (inputs[0].value.trim()) {
            activities.push({
                title: inputs[0].value,
                organization: inputs[1].value,
                duration: inputs[2].value,
                role: inputs[3].value,
                description: inputs[4].value
            });
        }
    });
    
    return activities;
}

// Get Achievements Data
function getAchievementsData() {
    const achievementItems = document.querySelectorAll('.achievement-item');
    const achievements = [];
    
    achievementItems.forEach(item => {
        const inputs = item.querySelectorAll('input, textarea');
        if (inputs[0].value.trim()) {
            achievements.push({
                title: inputs[0].value,
                year: inputs[1].value,
                description: inputs[2].value
            });
        }
    });
    
    return achievements;
}

// Add Dynamic Items
function addEducation() {
    const container = document.getElementById('educationContainer');
    const educationItem = document.createElement('div');
    educationItem.className = 'education-item';
    educationItem.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeItem(this)">×</button>
        <div class="form-row">
            <div class="form-field">
                <label>Degree</label>
                <input type="text" name="degree[]" placeholder="e.g., Bachelor of Science">
            </div>
            <div class="form-field">
                <label>Field of Study</label>
                <input type="text" name="fieldOfStudy[]" placeholder="e.g., Computer Science">
            </div>
        </div>
        <div class="form-row">
            <div class="form-field">
                <label>Institution</label>
                <input type="text" name="institution[]" placeholder="e.g., University Name">
            </div>
            <div class="form-field">
                <label>Graduation Year</label>
                <input type="number" name="graduationYear[]" placeholder="2023">
            </div>
        </div>
        <div class="form-field">
            <label>GPA (Optional)</label>
            <input type="text" name="gpa[]" placeholder="e.g., 3.8/4.0">
        </div>
    `;
    
    container.appendChild(educationItem);
    setupFormInputListeners(educationItem);
}

function addExperience() {
    const container = document.getElementById('experienceContainer');
    const experienceItem = document.createElement('div');
    experienceItem.className = 'experience-item';
    experienceItem.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeItem(this)">×</button>
        <div class="form-row">
            <div class="form-field">
                <label>Job Title</label>
                <input type="text" name="jobTitle[]" placeholder="e.g., Software Engineer">
            </div>
            <div class="form-field">
                <label>Company</label>
                <input type="text" name="company[]" placeholder="e.g., Tech Company">
            </div>
        </div>
        <div class="form-row">
            <div class="form-field">
                <label>Start Date</label>
                <input type="month" name="startDate[]">
            </div>
            <div class="form-field">
                <label>End Date</label>
                <input type="month" name="endDate[]">
            </div>
        </div>
        <div class="form-field">
            <label>Description</label>
            <textarea name="jobDescription[]" rows="3" placeholder="Describe your responsibilities and achievements..."></textarea>
        </div>
    `;
    
    container.appendChild(experienceItem);
    setupFormInputListeners(experienceItem);
}

function addProject() {
    const container = document.getElementById('projectsContainer');
    const projectItem = document.createElement('div');
    projectItem.className = 'project-item';
    projectItem.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeItem(this)">×</button>
        <div class="form-row">
            <div class="form-field">
                <label>Project Name</label>
                <input type="text" name="projectName[]" placeholder="e.g., E-commerce Website">
            </div>
            <div class="form-field">
                <label>Technologies</label>
                <input type="text" name="projectTech[]" placeholder="e.g., React, Node.js, MongoDB">
            </div>
        </div>
        <div class="form-field">
            <label>Description</label>
            <textarea name="projectDescription[]" rows="3" placeholder="Describe your project..."></textarea>
        </div>
        <div class="form-field">
            <label>Project URL (Optional)</label>
            <input type="url" name="projectUrl[]" placeholder="https://project-url.com">
        </div>
    `;
    
    container.appendChild(projectItem);
    setupFormInputListeners(projectItem);
}

function addCertification() {
    const container = document.getElementById('certificationsContainer');
    const certificationItem = document.createElement('div');
    certificationItem.className = 'certification-item';
    certificationItem.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeItem(this)">×</button>
        <div class="form-row">
            <div class="form-field">
                <label>Certification Name</label>
                <input type="text" name="certName[]" placeholder="e.g., AWS Certified Developer">
            </div>
            <div class="form-field">
                <label>Issuing Organization</label>
                <input type="text" name="certOrg[]" placeholder="e.g., Amazon Web Services">
            </div>
        </div>
        <div class="form-row">
            <div class="form-field">
                <label>Issue Date</label>
                <input type="month" name="certIssueDate[]">
            </div>
            <div class="form-field">
                <label>Expiry Date (Optional)</label>
                <input type="month" name="certExpiryDate[]">
            </div>
        </div>
    `;
    
    container.appendChild(certificationItem);
    setupFormInputListeners(certificationItem);
}

// Add Extra Curricular Activity
function addActivity() {
    const container = document.getElementById('activitiesContainer');
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeItem(this)">×</button>
        <div class="form-row">
            <div class="form-field">
                <label>Activity Title</label>
                <input type="text" name="activityTitle[]" placeholder="e.g., Student Council Member">
            </div>
            <div class="form-field">
                <label>Organization</label>
                <input type="text" name="activityOrg[]" placeholder="e.g., College Name">
            </div>
        </div>
        <div class="form-row">
            <div class="form-field">
                <label>Duration</label>
                <input type="text" name="activityDuration[]" placeholder="e.g., 2022-2023">
            </div>
            <div class="form-field">
                <label>Role</label>
                <input type="text" name="activityRole[]" placeholder="e.g., President, Member">
            </div>
        </div>
        <div class="form-field">
            <label>Description</label>
            <textarea name="activityDescription[]" rows="2" placeholder="Describe your role and achievements..."></textarea>
        </div>
    `;
    
    container.appendChild(activityItem);
    setupFormInputListeners(activityItem);
}

// Add Achievement
function addAchievement() {
    const container = document.getElementById('achievementsContainer');
    const achievementItem = document.createElement('div');
    achievementItem.className = 'achievement-item';
    achievementItem.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeItem(this)">×</button>
        <div class="form-row">
            <div class="form-field">
                <label>Award/Achievement</label>
                <input type="text" name="achievementTitle[]" placeholder="e.g., Best Student Award">
            </div>
            <div class="form-field">
                <label>Year</label>
                <input type="number" name="achievementYear[]" placeholder="2023">
            </div>
        </div>
        <div class="form-field">
            <label>Description</label>
            <textarea name="achievementDescription[]" rows="2" placeholder="Describe the achievement and criteria..."></textarea>
        </div>
    `;
    
    container.appendChild(achievementItem);
    setupFormInputListeners(achievementItem);
}

// Add Higher Education (renamed from addEducation)
function addHigherEducation() {
    const container = document.getElementById('higherEducationContainer');
    const educationItem = document.createElement('div');
    educationItem.className = 'education-item';
    educationItem.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeItem(this)">×</button>
        <div class="form-row">
            <div class="form-field">
                <label>Degree</label>
                <input type="text" name="degree[]" placeholder="e.g., Bachelor of Science">
            </div>
            <div class="form-field">
                <label>Field of Study</label>
                <input type="text" name="fieldOfStudy[]" placeholder="e.g., Computer Science">
            </div>
        </div>
        <div class="form-row">
            <div class="form-field">
                <label>Institution</label>
                <input type="text" name="institution[]" placeholder="e.g., University Name">
            </div>
            <div class="form-field">
                <label>Graduation Year</label>
                <input type="number" name="graduationYear[]" placeholder="2023">
            </div>
        </div>
        <div class="form-field">
            <label>GPA (Optional)</label>
            <input type="text" name="gpa[]" placeholder="e.g., 3.8/4.0">
        </div>
    `;
    
    container.appendChild(educationItem);
    setupFormInputListeners(educationItem);
}

// Remove dynamic items
function removeItem(button) {
    button.parentElement.remove();
    updatePreview();
}

// Setup form input listeners for dynamic items
function setupFormInputListeners(container) {
    const inputs = container.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });
}

// Update Preview
function updatePreview() {
    const preview = document.getElementById('resumePreview');
    const formData = new FormData(document.getElementById('resumeForm'));
    
    const resumeData = {
        firstName: formData.get('firstName') || '',
        lastName: formData.get('lastName') || '',
        email: formData.get('email') || '',
        phone: formData.get('phone') || '',
        jobTitle: formData.get('jobTitle') || '',
        address: formData.get('address') || '',
        linkedin: formData.get('linkedin') || '',
        github: formData.get('github') || '',
        summary: formData.get('summary') || '',
        profileImage: window.profileImageData || null,
        education: getEducationData(),
        experience: getExperienceData(),
        skills: formData.get('skills') || '',
        activities: getActivitiesData(),
        achievements: getAchievementsData(),
        projects: getProjectsData(),
        certifications: getCertificationsData()
    };
    
    if (resumeData.firstName || resumeData.lastName) {
        preview.className = 'resume-preview has-content';
        preview.innerHTML = generateResumeHTML(resumeData, currentTemplate);
    } else {
        preview.className = 'resume-preview';
        preview.innerHTML = 'Start filling out the form to see a live preview of your resume';
    }
}

// Generate Resume HTML
function generateResumeHTML(data, template) {
    switch (template) {
        case 'modern':
            return generateModernTemplate(data);
        case 'classic':
            return generateClassicTemplate(data);
        case 'creative':
            return generateCreativeTemplate(data);
        default:
            return generateModernTemplate(data);
    }
}

// Generate Downloadable Resume HTML (Two-column layout like the examples)
function generateDownloadableResumeHTML(data, template) {
    // Ensure image data is properly formatted for download
    let imageData = data.profileImage;
    if (imageData && !imageData.startsWith('data:image/')) {
        imageData = `data:image/jpeg;base64,${imageData}`;
    }
    
    return `
        <header class="resume-header">
            <div class="header-content">
                ${imageData ? `
                    <div class="profile-image">
                        <img src="${imageData}" alt="Profile Picture" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block'; console.error('Image failed to load');"
                             onload="console.log('Image loaded successfully')">
                        <div style="display: none; text-align: center; padding: 20px; color: #666;">
                            <i class="fas fa-user-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                            <p>Profile Image</p>
                        </div>
                    </div>
                ` : ''}
                <div class="header-text">
                    <h1>${data.firstName} ${data.lastName}</h1>
                    <div class="job-title">${data.jobTitle || 'Professional Resume'}</div>
                    <div class="contact-info">
                        ${data.email ? `<span><i class="fas fa-envelope"></i> ${data.email}</span>` : ''}
                        ${data.phone ? `<span><i class="fas fa-phone"></i> ${data.phone}</span>` : ''}
                        ${data.address ? `<span><i class="fas fa-map-marker-alt"></i> ${data.address}</span>` : ''}
                        ${data.linkedin ? `<span><i class="fab fa-linkedin"></i> ${data.linkedin}</span>` : ''}
                        ${data.github ? `<span><i class="fab fa-github"></i> ${data.github}</span>` : ''}
                    </div>
                </div>
            </div>
        </header>
        
        <div class="resume-main">
            <div class="left-column">
                ${data.summary ? `
                    <section class="resume-section">
                        <h2><i class="fas fa-user"></i> Professional Summary</h2>
                        <p class="summary-text">${data.summary}</p>
                    </section>
                ` : ''}
                
                ${data.skills ? `
                    <section class="resume-section">
                        <h2><i class="fas fa-tools"></i> Skills</h2>
                        <div class="skills-list">
                            ${data.skills.split(',').map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
                        </div>
                    </section>
                ` : ''}
                
                ${data.activities && data.activities.length > 0 ? `
                    <section class="resume-section">
                        <h2><i class="fas fa-star"></i> Extra Curricular Activities</h2>
                        ${data.activities.map(activity => `
                            <div class="activity-entry">
                                <h3>${activity.title}</h3>
                                <p class="institution">${activity.organization} • ${activity.role}</p>
                                <p class="period">${activity.duration}</p>
                                <p class="description">${activity.description}</p>
                            </div>
                        `).join('')}
                    </section>
                ` : ''}
                
                ${data.achievements && data.achievements.length > 0 ? `
                    <section class="resume-section">
                        <h2><i class="fas fa-trophy"></i> Achievements & Awards</h2>
                        ${data.achievements.map(achievement => `
                            <div class="achievement-entry">
                                <h3>${achievement.title}</h3>
                                <p class="period">${achievement.year}</p>
                                <p class="description">${achievement.description}</p>
                            </div>
                        `).join('')}
                    </section>
                ` : ''}
                
                ${data.certifications && data.certifications.length > 0 ? `
                    <section class="resume-section">
                        <h2><i class="fas fa-certificate"></i> Certifications</h2>
                        ${data.certifications.map(cert => `
                            <div class="certification-entry">
                                <h3>${cert.name}</h3>
                                <p class="institution">${cert.organization}</p>
                                <p class="period">${cert.issueDate}${cert.expiryDate ? ` - ${cert.expiryDate}` : ''}</p>
                            </div>
                        `).join('')}
                    </section>
                ` : ''}
            </div>
            
            <div class="right-column">
                ${data.experience && data.experience.length > 0 ? `
                    <section class="resume-section">
                        <h2><i class="fas fa-briefcase"></i> Professional Experience</h2>
                        ${data.experience.map(exp => `
                            <div class="experience-entry">
                                <h3 class="company">${exp.company}</h3>
                                <h4 class="job-title">${exp.jobTitle}</h4>
                                <p class="period">${exp.startDate} - ${exp.endDate || 'Present'}</p>
                                <p class="description">${exp.description}</p>
                            </div>
                        `).join('')}
                    </section>
                ` : ''}
                
                <section class="resume-section">
                    <h2><i class="fas fa-graduation-cap"></i> Education</h2>
                    
                    ${data.education && data.education.xClass && data.education.xClass.board ? `
                        <div class="education-entry">
                            <h3 class="degree">X Class (10th Standard)</h3>
                            <p class="institution">${data.education.xClass.board} • ${data.education.xClass.school}</p>
                            <p class="period">${data.education.xClass.year} • ${data.education.xClass.percentage}</p>
                        </div>
                    ` : ''}
                    
                    ${data.education && data.education.xiiClass && data.education.xiiClass.board ? `
                        <div class="education-entry">
                            <h3 class="degree">XII Class (12th Standard)</h3>
                            <p class="institution">${data.education.xiiClass.board} • ${data.education.xiiClass.school}</p>
                            <p class="period">${data.education.xiiClass.year} • ${data.education.xiiClass.percentage} • ${data.education.xiiClass.stream}</p>
                        </div>
                    ` : ''}
                    
                    ${data.education && data.education.higherEducation && data.education.higherEducation.length > 0 ? `
                        ${data.education.higherEducation.map(edu => `
                            <div class="education-entry">
                                <h3 class="degree">${edu.degree}</h3>
                                <p class="institution">${edu.institution} • ${edu.fieldOfStudy} • ${edu.graduationYear}</p>
                                ${edu.gpa ? `<p class="period">GPA: ${edu.gpa}</p>` : ''}
                            </div>
                        `).join('')}
                    ` : ''}
                </section>
                
                ${data.projects && data.projects.length > 0 ? `
                    <section class="resume-section">
                        <h2><i class="fas fa-project-diagram"></i> Projects</h2>
                        ${data.projects.map(project => `
                            <div class="project-entry">
                                <h3 class="company">${project.name}</h3>
                                <div class="technologies">
                                    ${project.technologies.split(',').map(tech => {
                                        const techName = tech.trim();
                                        // Check if it's a programming language
                                        const isProgrammingLang = ['javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'typescript', 'html', 'css', 'sql', 'r', 'matlab', 'scala', 'perl', 'bash', 'powershell'].includes(techName.toLowerCase());
                                        return `<span class="tech-tag ${isProgrammingLang ? 'programming-lang' : 'tech-tool'}">${techName}</span>`;
                                    }).join('')}
                                </div>
                                <p class="description">${project.description}</p>
                                ${project.url ? `<p class="url"><a href="${project.url}" target="_blank">View Project</a></p>` : ''}
                            </div>
                        `).join('')}
                    </section>
                ` : ''}
            </div>
        </div>
    `;
}

// Template Generators
function generateModernTemplate(data) {
    return `
        <div class="modern-resume">
            <header class="resume-header">
                <div class="header-content">
                    ${data.profileImage ? `
                        <div class="profile-image">
                            <img src="${data.profileImage}" alt="Profile Picture">
                        </div>
                    ` : ''}
                    <div class="header-text">
                        <h1>${data.firstName} ${data.lastName}</h1>
                        <p class="contact-info">
                            ${data.email ? `<span><i class="fas fa-envelope"></i> ${data.email}</span>` : ''}
                            ${data.phone ? `<span><i class="fas fa-phone"></i> ${data.phone}</span>` : ''}
                            ${data.address ? `<span><i class="fas fa-map-marker-alt"></i> ${data.address}</span>` : ''}
                        </p>
                    </div>
                </div>
            </header>
            
            ${data.summary ? `
            <section class="resume-section">
                <h2><i class="fas fa-user"></i> Professional Summary</h2>
                <p>${data.summary}</p>
            </section>
            ` : ''}
            
            ${data.education.length > 0 ? `
            <section class="resume-section">
                <h2><i class="fas fa-graduation-cap"></i> Education</h2>
                ${data.education.map(edu => `
                    <div class="education-entry">
                        <h3>${edu.degree}</h3>
                        <p class="institution">${edu.institution} • ${edu.fieldOfStudy} • ${edu.graduationYear}</p>
                        ${edu.gpa ? `<p class="gpa">GPA: ${edu.gpa}</p>` : ''}
                    </div>
                `).join('')}
            </section>
            ` : ''}
            
            ${data.experience.length > 0 ? `
            <section class="resume-section">
                <h2><i class="fas fa-briefcase"></i> Work Experience</h2>
                ${data.experience.map(exp => `
                    <div class="experience-entry">
                        <h3>${exp.jobTitle}</h3>
                        <p class="company">${exp.company} • ${exp.startDate} - ${exp.endDate || 'Present'}</p>
                        <p class="description">${exp.description}</p>
                    </div>
                `).join('')}
            </section>
            ` : ''}
            
            ${data.skills ? `
            <section class="resume-section">
                <h2><i class="fas fa-tools"></i> Skills</h2>
                <div class="skills-list">
                    ${data.skills.split(',').map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
                </div>
            </section>
            ` : ''}
            
            ${data.projects.length > 0 ? `
            <section class="resume-section">
                <h2><i class="fas fa-project-diagram"></i> Projects</h2>
                ${data.projects.map(project => `
                    <div class="project-entry">
                        <h3>${project.name}</h3>
                        <p class="technologies">${project.technologies}</p>
                        <p class="description">${project.description}</p>
                        ${project.url ? `<p class="url"><a href="${project.url}" target="_blank">View Project</a></p>` : ''}
                    </div>
                `).join('')}
            </section>
            ` : ''}
            
            ${data.certifications.length > 0 ? `
            <section class="resume-section">
                <h2><i class="fas fa-certificate"></i> Certifications</h2>
                ${data.certifications.map(cert => `
                    <div class="certification-entry">
                        <h3>${cert.name}</h3>
                        <p class="organization">${cert.organization} • ${cert.issueDate}</p>
                        ${cert.expiryDate ? `<p class="expiry">Expires: ${cert.expiryDate}</p>` : ''}
                    </div>
                `).join('')}
            </section>
            ` : ''}
        </div>
    `;
}

function generateClassicTemplate(data) {
    return `
        <div class="classic-resume">
            <header class="resume-header">
                <div class="header-content">
                    ${data.profileImage ? `
                        <div class="profile-image">
                            <img src="${data.profileImage}" alt="Profile Picture">
                        </div>
                    ` : ''}
                    <div class="header-text">
                        <h1>${data.firstName} ${data.lastName}</h1>
                        <div class="contact-info">
                            ${data.email ? `<p>${data.email}</p>` : ''}
                            ${data.phone ? `<p>${data.phone}</p>` : ''}
                            ${data.address ? `<p>${data.address}</p>` : ''}
                        </div>
                    </div>
                </div>
            </header>
            
            ${data.summary ? `
            <section class="resume-section">
                <h2>SUMMARY</h2>
                <p>${data.summary}</p>
            </section>
            ` : ''}
            
            ${data.education.length > 0 ? `
            <section class="resume-section">
                <h2>EDUCATION</h2>
                ${data.education.map(edu => `
                    <div class="education-entry">
                        <h3>${edu.degree}</h3>
                        <p>${edu.institution}, ${edu.fieldOfStudy}</p>
                        <p>${edu.graduationYear}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</p>
                    </div>
                `).join('')}
            </section>
            ` : ''}
            
            ${data.experience.length > 0 ? `
            <section class="resume-section">
                <h2>EXPERIENCE</h2>
                ${data.experience.map(exp => `
                    <div class="experience-entry">
                        <h3>${exp.jobTitle}</h3>
                        <p><strong>${exp.company}</strong> | ${exp.startDate} - ${exp.endDate || 'Present'}</p>
                        <p>${exp.description}</p>
                    </div>
                `).join('')}
            </section>
            ` : ''}
            
            ${data.skills ? `
            <section class="resume-section">
                <h2>SKILLS</h2>
                <p>${data.skills}</p>
            </section>
            ` : ''}
        </div>
    `;
}

function generateCreativeTemplate(data) {
    return `
        <div class="creative-resume">
            <header class="resume-header">
                <div class="header-content">
                    ${data.profileImage ? `
                        <div class="profile-image">
                            <img src="${data.profileImage}" alt="Profile Picture">
                        </div>
                    ` : ''}
                    <div class="header-text">
                        <div class="name-section">
                            <h1>${data.firstName}</h1>
                            <h1 class="last-name">${data.lastName}</h1>
                        </div>
                        <div class="contact-info">
                            ${data.email ? `<span><i class="fas fa-envelope"></i> ${data.email}</span>` : ''}
                            ${data.phone ? `<span><i class="fas fa-phone"></i> ${data.phone}</span>` : ''}
                            ${data.address ? `<span><i class="fas fa-map-marker-alt"></i> ${data.address}</span>` : ''}
                        </div>
                    </div>
                </div>
            </header>
            
            ${data.summary ? `
            <section class="resume-section">
                <h2>About Me</h2>
                <p>${data.summary}</p>
            </section>
            ` : ''}
            
            <div class="resume-grid">
                ${data.education.length > 0 ? `
                <section class="resume-section">
                    <h2><i class="fas fa-graduation-cap"></i> Education</h2>
                    ${data.education.map(edu => `
                        <div class="education-entry">
                            <h3>${edu.degree}</h3>
                            <p>${edu.institution}</p>
                            <p>${edu.fieldOfStudy} • ${edu.graduationYear}</p>
                        </div>
                    `).join('')}
                </section>
                ` : ''}
                
                ${data.skills ? `
                <section class="resume-section">
                    <h2><i class="fas fa-tools"></i> Skills</h2>
                    <div class="skills-grid">
                        ${data.skills.split(',').map(skill => `<span class="skill-item">${skill.trim()}</span>`).join('')}
                    </div>
                </section>
                ` : ''}
            </div>
            
            ${data.experience.length > 0 ? `
            <section class="resume-section">
                <h2><i class="fas fa-briefcase"></i> Experience</h2>
                ${data.experience.map(exp => `
                    <div class="experience-entry">
                        <div class="experience-header">
                            <h3>${exp.jobTitle}</h3>
                            <span class="company">${exp.company}</span>
                            <span class="period">${exp.startDate} - ${exp.endDate || 'Present'}</span>
                        </div>
                        <p>${exp.description}</p>
                    </div>
                `).join('')}
            </section>
            ` : ''}
        </div>
    `;
}

// Template Selection
function selectTemplate(template) {
    currentTemplate = template;
    document.getElementById('templateSelect').value = template;
    updatePreview();
    showNotification(`Template changed to ${template}`, 'info');
}

function changeTemplate() {
    const templateSelect = document.getElementById('templateSelect');
    currentTemplate = templateSelect.value;
    updatePreview();
}

// Generate and Download Resume
async function generateResume() {
    const formData = new FormData(document.getElementById('resumeForm'));
    const resumeData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        jobTitle: formData.get('jobTitle'),
        address: formData.get('address'),
        linkedin: formData.get('linkedin'),
        github: formData.get('github'),
        summary: formData.get('summary'),
        profileImage: window.profileImageData || null,
        education: getEducationData(),
        experience: getExperienceData(),
        skills: formData.get('skills'),
        activities: getActivitiesData(),
        achievements: getAchievementsData(),
        projects: getProjectsData(),
        certifications: getCertificationsData()
    };

    if (!resumeData.firstName || !resumeData.lastName) {
        showNotification('Please fill in at least your first and last name', 'warning');
        return;
    }

    // Debug: Log image data to console
    if (resumeData.profileImage) {
        console.log('Profile image data length:', resumeData.profileImage.length);
        console.log('Profile image data starts with:', resumeData.profileImage.substring(0, 50));
    }

    try {
        const response = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ resumeData })
        });

        if (response.ok) {
            const result = await response.json();
            showNotification('Resume generated successfully!', 'success');
            
            // For now, we'll create a simple HTML download
            // In a real application, you'd use a PDF generation library
            downloadResumeAsHTML(resumeData);
        }
    } catch (error) {
        console.error('Error generating resume:', error);
        showNotification('Error generating resume. Please try again.', 'error');
    }
}

// Test Image Download Function
function testImageDownload() {
    if (!window.profileImageData) {
        showNotification('No profile image uploaded yet!', 'warning');
        return;
    }
    
    // Create a simple test HTML to verify image display
    const testHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Image Test</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .test-image { width: 200px; height: 200px; border-radius: 50%; border: 3px solid #667eea; }
            </style>
        </head>
        <body>
            <h1>Profile Image Test</h1>
            <p>If you can see the image below, the download should work correctly:</p>
            <img src="${window.profileImageData}" alt="Test Profile Picture" class="test-image">
            <p>Image data length: ${window.profileImageData.length}</p>
            <p>Image data starts with: ${window.profileImageData.substring(0, 100)}...</p>
        </body>
        </html>
    `;
    
    const blob = new Blob([testHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image_test.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Image test file downloaded. Open it to check if the image displays correctly.', 'info');
}

// Download Resume as HTML
function downloadResumeAsHTML(data) {
    // Ensure the image data is properly formatted
    let imageData = data.profileImage;
    if (imageData && !imageData.startsWith('data:image/')) {
        imageData = `data:image/jpeg;base64,${imageData}`;
    }
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${data.firstName} ${data.lastName} - Resume</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background: white;
                    padding: 0;
                    margin: 0;
                }
                
                .resume-container {
                    max-width: 210mm;
                    margin: 0 auto;
                    background: white;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                }
                
                /* Header Styles */
                .resume-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 2rem;
                    position: relative;
                    overflow: hidden;
                }
                
                .header-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 2rem;
                    position: relative;
                    z-index: 2;
                }
                
                .profile-image {
                    flex-shrink: 0;
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                    background: white;
                }
                
                .profile-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .header-text {
                    flex: 1;
                }
                
                .header-text h1 {
                    font-size: 3rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .job-title {
                    font-size: 1.5rem;
                    font-weight: 400;
                    opacity: 0.9;
                    margin-bottom: 1rem;
                }
                
                .contact-info {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                    font-size: 1rem;
                }
                
                .contact-info span {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .contact-info i {
                    width: 18px;
                    color: rgba(255, 255, 255, 0.8);
                }
                
                /* Main Content */
                .resume-main {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 0;
                    min-height: 297mm;
                }
                
                .left-column {
                    background: #f8fafc;
                    padding: 2rem;
                    border-right: 1px solid #e2e8f0;
                }
                
                .right-column {
                    padding: 2rem;
                    background: white;
                }
                
                /* Section Styles */
                .resume-section {
                    margin-bottom: 2rem;
                }
                
                .resume-section h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #667eea;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #667eea;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .resume-section h2 i {
                    font-size: 1rem;
                }
                
                .resume-section h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 0.5rem;
                }
                
                /* Skills */
                .skills-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                
                .skill-tag {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                }
                
                /* Technology Tags */
                .technologies {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                
                .tech-tag {
                    padding: 0.4rem 0.8rem;
                    border-radius: 15px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: white;
                    transition: all 0.3s ease;
                }
                
                .tech-tag.programming-lang {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
                }
                
                .tech-tag.tech-tool {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
                }
                
                .tech-tag:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                
                /* Experience and Education */
                .experience-entry,
                .education-entry {
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                
                .experience-entry:last-child,
                .education-entry:last-child {
                    border-bottom: none;
                }
                
                .company,
                .institution {
                    color: #667eea;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                
                .job-title,
                .degree {
                    color: #1e293b;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                
                .period,
                .location {
                    color: #64748b;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }
                
                .description {
                    color: #475569;
                    line-height: 1.6;
                }
                
                /* Summary */
                .summary-text {
                    color: #475569;
                    line-height: 1.7;
                    font-size: 1rem;
                }
                
                /* Print Styles */
                @media print {
                    body { margin: 0; }
                    .resume-container { box-shadow: none; }
                    .resume-main { page-break-inside: avoid; }
                }
                
                /* Additional Professional Styling */
                .resume-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
                    z-index: 1;
                }
                
                .profile-image {
                    position: relative;
                    z-index: 3;
                }
                
                .skill-tag {
                    transition: all 0.3s ease;
                }
                
                .skill-tag:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }
                
                .resume-section h2 {
                    position: relative;
                }
                
                .resume-section h2::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 50px;
                    height: 2px;
                    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                }
                
                .experience-entry,
                .education-entry {
                    position: relative;
                    padding-left: 1rem;
                }
                
                .experience-entry::before,
                .education-entry::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0.5rem;
                    width: 6px;
                    height: 6px;
                    background: #667eea;
                    border-radius: 50%;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .resume-main {
                        grid-template-columns: 1fr;
                    }
                    
                    .left-column {
                        border-right: none;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    
                    .header-content {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .profile-image {
                        align-self: center;
                    }
                }
            </style>
        </head>
        <body>
            <div class="resume-container">
                ${generateDownloadableResumeHTML(data, currentTemplate)}
            </div>
        </body>
        </html>
    `;

    // Create blob with proper encoding
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.firstName}_${data.lastName}_Resume.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Load Resumes
async function loadResumes() {
    try {
        const response = await fetch('/api/resumes');
        if (response.ok) {
            const resumes = await response.json();
            displayResumes(resumes);
        }
    } catch (error) {
        console.error('Error loading resumes:', error);
    }
}

// Display Resumes
function displayResumes(resumes) {
    const resumesList = document.getElementById('resumesList');
    if (!resumesList) return;

    if (resumes.length === 0) {
        resumesList.innerHTML = '<p class="no-resumes">No resumes found. Create your first resume or upload an existing one!</p>';
        return;
    }

    resumesList.innerHTML = resumes.map(resume => `
        <div class="resume-item">
            <div class="resume-info">
                <h3>${resume.filename || `${resume.firstName || 'Untitled'} Resume`}</h3>
                <p>${resume.type === 'generated' ? 'Generated Resume' : 'Uploaded File'} • ${new Date(resume.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="resume-actions">
                ${resume.filePath ? `
                    <button class="btn btn-primary" onclick="downloadResume(${resume.id})">
                        <i class="fas fa-download"></i> Download
                    </button>
                ` : ''}
                ${resume.type === 'generated' ? `
                    <button class="btn btn-secondary" onclick="editResume(${resume.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                ` : ''}
                <button class="btn btn-danger" onclick="deleteResume(${resume.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Download Resume
async function downloadResume(id) {
    try {
        window.open(`/api/download/${id}`, '_blank');
    } catch (error) {
        console.error('Error downloading resume:', error);
        showNotification('Error downloading resume', 'error');
    }
}

// Edit Resume
async function editResume(id) {
    try {
        const response = await fetch(`/api/resumes/${id}`);
        if (response.ok) {
            const resume = await response.json();
            currentResumeId = id;
            populateForm(resume);
            showTab('builder');
            showNotification('Resume loaded for editing', 'info');
        }
    } catch (error) {
        console.error('Error loading resume for editing:', error);
        showNotification('Error loading resume for editing', 'error');
    }
}

// Delete Resume
async function deleteResume(id) {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
        const response = await fetch(`/api/resumes/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Resume deleted successfully', 'success');
            loadResumes();
        }
    } catch (error) {
        console.error('Error deleting resume:', error);
        showNotification('Error deleting resume', 'error');
    }
}

// Populate Form
function populateForm(resume) {
    const form = document.getElementById('resumeForm');
    
    // Basic fields
    form.firstName.value = resume.firstName || '';
    form.lastName.value = resume.lastName || '';
    form.email.value = resume.email || '';
    form.phone.value = resume.phone || '';
    form.jobTitle.value = resume.jobTitle || '';
    form.address.value = resume.address || '';
    form.linkedin.value = resume.linkedin || '';
    form.github.value = resume.github || '';
    form.summary.value = resume.summary || '';
    form.skills.value = resume.skills || '';
    
    // Profile image
    if (resume.profileImage) {
        window.profileImageData = resume.profileImage;
        displayProfileImage(resume.profileImage);
    }
    
    // Education - X and XII Class
    if (resume.education && resume.education.xClass) {
        const xClass = resume.education.xClass;
        if (document.querySelector('input[name="xBoard"]')) {
            document.querySelector('input[name="xBoard"]').value = xClass.board || '';
            document.querySelector('input[name="xSchool"]').value = xClass.school || '';
            document.querySelector('input[name="xYear"]').value = xClass.year || '';
            document.querySelector('input[name="xPercentage"]').value = xClass.percentage || '';
        }
    }
    
    if (resume.education && resume.education.xiiClass) {
        const xiiClass = resume.education.xiiClass;
        if (document.querySelector('input[name="xiiBoard"]')) {
            document.querySelector('input[name="xiiBoard"]').value = xiiClass.board || '';
            document.querySelector('input[name="xiiSchool"]').value = xiiClass.school || '';
            document.querySelector('input[name="xiiYear"]').value = xiiClass.year || '';
            document.querySelector('input[name="xiiPercentage"]').value = xiiClass.percentage || '';
            document.querySelector('input[name="xiiStream"]').value = xiiClass.stream || '';
        }
    }
    
    // Higher Education
    if (resume.education && resume.education.higherEducation) {
        populateDynamicSection('higherEducationContainer', resume.education.higherEducation || [], 'education-item', [
            'degree', 'fieldOfStudy', 'institution', 'graduationYear', 'gpa'
        ]);
    }
    
    // Experience
    populateDynamicSection('experienceContainer', resume.experience || [], 'experience-item', [
        'jobTitle', 'company', 'startDate', 'endDate', 'jobDescription'
    ]);
    
    // Projects
    populateDynamicSection('projectsContainer', resume.projects || [], 'project-item', [
        'projectName', 'projectTech', 'projectDescription', 'projectUrl'
    ]);
    
    // Activities
    populateDynamicSection('activitiesContainer', resume.activities || [], 'activity-item', [
        'activityTitle', 'activityOrg', 'activityDuration', 'activityRole', 'activityDescription'
    ]);
    
    // Achievements
    populateDynamicSection('achievementsContainer', resume.achievements || [], 'achievement-item', [
        'achievementTitle', 'achievementYear', 'achievementDescription'
    ]);
    
    // Certifications
    populateDynamicSection('certificationsContainer', resume.certifications || [], 'certification-item', [
        'certName', 'certOrg', 'certIssueDate', 'certExpiryDate'
    ]);
    
    updatePreview();
}

// Populate Dynamic Section
function populateDynamicSection(containerId, items, itemClass, fieldNames) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear existing items except the first one
    const existingItems = container.querySelectorAll(`.${itemClass}`);
    for (let i = 1; i < existingItems.length; i++) {
        existingItems[i].remove();
    }
    
    // Populate first item
    if (items.length > 0) {
        const firstItem = existingItems[0];
        const inputs = firstItem.querySelectorAll('input, textarea');
        fieldNames.forEach((fieldName, index) => {
            if (inputs[index]) {
                inputs[index].value = items[0][fieldName] || '';
            }
        });
    }
    
    // Add additional items
    for (let i = 1; i < items.length; i++) {
        if (itemClass === 'education-item') {
            addEducation();
        } else if (itemClass === 'experience-item') {
            addExperience();
        } else if (itemClass === 'project-item') {
            addProject();
        } else if (itemClass === 'certification-item') {
            addCertification();
        }
        
        const newItem = container.lastElementChild;
        const inputs = newItem.querySelectorAll('input, textarea');
        fieldNames.forEach((fieldName, index) => {
            if (inputs[index]) {
                inputs[index].value = items[i][fieldName] || '';
            }
        });
    }
}

// Show Tab
function showTab(tabName) {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Upload Form Functions
function showUploadForm() {
    document.getElementById('uploadForm').style.display = 'block';
}

function hideUploadForm() {
    document.getElementById('uploadForm').style.display = 'none';
}

// Modal Functions
function openModal() {
    document.getElementById('editModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 300px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    // Add close button styles
    const closeBtn = notification.querySelector('button');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
} 