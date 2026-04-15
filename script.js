// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    });
});

// Active nav link on scroll
const sections = document.querySelectorAll('.section, .hero');
const navItems = document.querySelectorAll('.nav-links a');

const observerOptions = {
    root: null,
    rootMargin: '-80px 0px -60% 0px',
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navItems.forEach(item => item.classList.remove('active'));
            const activeLink = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    });
}, observerOptions);

sections.forEach(section => observer.observe(section));

// Fade-in animation on scroll
const fadeElements = document.querySelectorAll(
    '.timeline-item, .education-card, .skill-category, .cert-group, .recommendation-card, .contact-item'
);

fadeElements.forEach(el => el.classList.add('fade-in'));

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

fadeElements.forEach(el => fadeObserver.observe(el));

// Smooth scroll for anchor links (fallback)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Contact form handling — saves submissions as markdown to GitHub repo
const GITHUB_TOKEN = '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';
const GITHUB_REPO = 'jmccartan/CVSiteContactMeSubmissions';

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Sending...</span>';
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());
        const now = new Date();
        const timestamp = now.toISOString();
        const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        const markdown = [
            `# Contact Form Submission`,
            ``,
            `**Date:** ${dateStr}`,
            `**Name:** ${data.name}`,
            `**Email:** ${data.email}`,
            data.company ? `**Company:** ${data.company}` : null,
            `**Subject:** ${data.subject}`,
            ``,
            `## Message`,
            ``,
            data.message,
            ``,
            `---`,
            `*Submitted via johnmccartan.com at ${timestamp}*`
        ].filter(Boolean).join('\n');

        const filename = `contact-${data.name.replace(/\s+/g, '-').toLowerCase()}-${now.toISOString().replace(/[:.]/g, '-')}.md`;
        const path = `contactme/${filename}`;

        try {
            const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `New contact submission from ${data.name}`,
                    content: btoa(unescape(encodeURIComponent(markdown)))
                })
            });

            if (response.ok) {
                contactForm.style.display = 'none';
                document.getElementById('formSuccess').style.display = 'block';
            } else {
                alert('There was a problem submitting your message. Please try again.');
            }
        } catch (err) {
            alert('There was a problem submitting your message. Please try again.');
        }

        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}
