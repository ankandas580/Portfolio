import { portfolioData } from './data.js';

// DOM Elements
const chips = document.querySelectorAll('.chip');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const themeRadios = document.getElementsByName('theme');
const toast = document.getElementById('toast');

// Sections
const sections = {
    about: document.getElementById('about'),
    skills: document.getElementById('skills'),
    projects: document.getElementById('projects'),
    experience: document.getElementById('experience'),
    education: document.getElementById('education'),
    contact: document.getElementById('contact')
};

// State
let userPrefs = {
    theme: 'auto'
};

// Initialize
function init() {
    loadPreferences();
    renderAllSections();
    
    // Tab Navigation Logic
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const targetId = chip.dataset.target;
            
            // Save tab state to localStorage
            localStorage.setItem('portfolioActiveTab', targetId);
            
            // 1. Remove active class from all chips
            chips.forEach(c => c.classList.remove('active'));
            
            // 2. Add active class to clicked chip
            chip.classList.add('active');
            
            // 3. Hide all sections
            Object.values(sections).forEach(section => {
                if (section) section.classList.remove('active');
            });
            
            // 4. Show target section
            const targetSection = sections[targetId];
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Special case: re-trigger skill bars animation if Skills tab is opened
                if (targetId === 'skills') {
                    animateSkills();
                }
            }
        });
    });

    // Restore previously active tab on refresh
    const savedTab = localStorage.getItem('portfolioActiveTab');
    if (savedTab && savedTab !== 'about') {
        const targetChip = Array.from(chips).find(c => c.dataset.target === savedTab);
        if (targetChip) {
            targetChip.click();
        }
    }

    // Settings Modal
    settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.classList.add('hidden');
    });

    themeRadios.forEach(radio => {
        radio.addEventListener('change', handleThemeChange);
    });
}

function renderAllSections() {
    // Render About
    const p = portfolioData.personal;
    sections.about.innerHTML = `
        <h2 class="section-title">🎯 About Me</h2>
        <div class="result-card profile-card">
            <p class="profile-bio" style="font-size: 1.1rem; line-height: 1.7;">${p.bio}</p>
            <div class="profile-meta-grid">
                <div class="meta-item">
                    <span class="meta-icon">🏠</span>
                    <span class="meta-text"><strong>Home:</strong> ${p.location}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-icon">📍</span>
                    <span class="meta-text"><strong>Current Location:</strong> ${p.currentLocation}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-icon">📧</span>
                    <span class="meta-text"><strong>Email:</strong> ${p.email}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-icon">💼</span>
                    <span class="meta-text"><strong>Status:</strong> ${p.status}</span>
                </div>
            </div>
        </div>
    `;

    // Render Skills
    let skillsHtml = `<h2 class="section-title">💻 Technical Skills</h2>`;
    const categories = {
        programming: 'Programming Languages',
        analysis: 'Data Analysis & Libraries',
        ml: 'Machine Learning',
        database: 'Databases',
        visualization: 'Data Visualization & Analytics',
        tools: 'Tools & Platforms'
    };

    Object.keys(categories).forEach(catId => {
        const catSkills = portfolioData.skills.filter(s => s.category === catId);
        if (catSkills.length > 0) {
            skillsHtml += `
                <div class="result-card">
                    <h3 style="margin-bottom: 1.25rem; font-weight: 600; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem; color: var(--primary-color)">
                        ${categories[catId]}
                    </h3>
                    <div class="skills-grid">
                        ${catSkills.map(s => `
                            <div class="skill-bar-card">
                                <div class="skill-title-row">
                                    <div class="skill-name-container">
                                        <span>${s.icon}</span>
                                        <span class="skill-name">${s.name}</span>
                                    </div>
                                    <span class="skill-level-text">${s.level}%</span>
                                </div>
                                <div class="skill-progress-bg">
                                    <div class="skill-progress-fill" data-level="${s.level}"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });
    sections.skills.innerHTML = skillsHtml;

    // Render Projects
    sections.projects.innerHTML = `
        <h2 class="section-title">🚀 Projects</h2>
        <div class="projects-grid">
            ${portfolioData.projects.map(p => `
                <div class="result-card project-card">
                    <div class="project-header-row">
                        <div class="project-title-container">
                            <span class="project-icon">${p.icon}</span>
                            <h3 class="project-title">${p.title}</h3>
                        </div>
                        ${p.badge ? `<span class="featured-badge" ${p.badge !== 'Featured' ? 'style="background: rgba(99, 102, 241, 0.1); color: var(--primary-color); border-color: rgba(99, 102, 241, 0.2);"' : ''}>${p.badge}</span>` : ''}
                    </div>
                    <p class="project-desc">${p.description}</p>
                    <div class="project-tags">
                        ${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
                    </div>
                    ${(p.github || p.link) ? `
                    <div class="project-links">
                        ${p.github ? `
                        <a href="${p.github}" target="_blank" class="project-link-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                            Codebase
                        </a>` : ''}
                        ${p.link ? `
                        <a href="${p.link}" target="_blank" class="project-link-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            Live Demo
                        </a>` : ''}
                    </div>` : ''}
                </div>
            `).join('')}
        </div>
    `;

    // Render Experience
    sections.experience.innerHTML = `
        <h2 class="section-title">💼 Professional Experience</h2>
        <div class="result-card">
            <div class="experience-timeline">
                ${portfolioData.experience.map(exp => `
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-header">
                            <div class="timeline-role">
                                <h3>${exp.role}</h3>
                                <span>${exp.company}</span>
                            </div>
                            <span class="timeline-period">${exp.period}</span>
                        </div>
                        <ul class="timeline-highlights">
                            ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Render Education
    sections.education.innerHTML = `
        <h2 class="section-title">🎓 Education</h2>
        <div class="result-card">
            <div class="experience-timeline">
                ${portfolioData.education.map(edu => `
                    <div class="timeline-item">
                        <div class="timeline-dot" style="border-color: var(--accent-color);"></div>
                        <div class="timeline-header">
                            <div class="timeline-role">
                                <h3>${edu.degree}</h3>
                                <span>${edu.school}</span>
                            </div>
                            <span class="timeline-period">${edu.period}</span>
                        </div>
                        <p style="font-size: 0.95rem; line-height: 1.5; color: var(--text-secondary); margin-top:0.25rem;">${edu.details}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Render Contact
    sections.contact.innerHTML = `
        <h2 class="section-title">📧 Contact Links</h2>
        <div class="contact-grid">
            <a href="mailto:${p.email}" class="result-card contact-card">
                <div class="contact-title">
                    <span class="contact-icon">📧</span>
                    Email Direct
                </div>
                <div class="contact-detail">${p.email}</div>
            </a>
            <a href="${p.linkedin}" target="_blank" class="result-card contact-card">
                <div class="contact-title">
                    <span class="contact-icon">💼</span>
                    LinkedIn
                </div>
                <div class="contact-detail">${p.linkedin}</div>
            </a>
            <a href="${p.github}" target="_blank" class="result-card contact-card">
                <div class="contact-title">
                    <span class="contact-icon">💻</span>
                    GitHub
                </div>
                <div class="contact-detail">${p.github}</div>
            </a>
        </div>
    `;
}

function animateSkills() {
    // Reset and animate skill bars
    const fills = document.querySelectorAll('.skill-progress-fill');
    fills.forEach(fill => {
        fill.style.width = '0%'; // Reset first
        setTimeout(() => {
            const level = fill.dataset.level;
            fill.style.width = `${level}%`;
        }, 50); // slight delay for css transition to catch reset
    });
}

// ---- Preferences & Themes ----
function loadPreferences() {
    const saved = localStorage.getItem('portfolioPrefsV2');
    if (saved) {
        userPrefs = JSON.parse(saved);
    }
    applyTheme(userPrefs.theme);
    themeRadios.forEach(r => r.checked = (r.value === userPrefs.theme));
}

function savePreferences() {
    localStorage.setItem('portfolioPrefsV2', JSON.stringify(userPrefs));
}

function handleThemeChange(e) {
    const newTheme = e.target.value;
    userPrefs.theme = newTheme;
    savePreferences();
    applyTheme(newTheme);
}

function applyTheme(themeMode) {
    const htmlElement = document.documentElement;
    htmlElement.classList.remove('light', 'dark');
    if (themeMode === 'light') htmlElement.classList.add('light');
    if (themeMode === 'dark') htmlElement.classList.add('dark');
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
}

// Bootstrap when DOM is complete
document.addEventListener('DOMContentLoaded', init);
