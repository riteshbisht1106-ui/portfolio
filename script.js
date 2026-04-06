
/* ========== Theme Toggle ========== */
const themeCheckbox = document.querySelector('#theme-checkbox');
const htmlElement = document.documentElement;

// Load saved theme preference
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeCheckbox.checked = true;
}

themeCheckbox.addEventListener('change', () => {
    if (themeCheckbox.checked) {
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
    }
});

/* ========== toggle icon navbar ========== */
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

/* ========== scroll sections active link ========== */
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        };
    });

    /* ========== sticky navbar ========== */
    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);

    /* ========== remove toggle icon and navbar when click navbar link (scroll) ========== */
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
};

/* ========== typed js ========== */
const typed = new Typed('.multiple-text', {
    strings: ['Frontend Developer', 'Web Designer', 'Certified Developer'],
    typeSpeed: 200,
    backSpeed: 200,
    backDelay: 2000,
    loop: true
});

/* ========== Scroll Reveal (Intersection Observer) ========== */
const scrollReveal = (selector, origin, distance = '50px', duration = 800, delay = 100) => {
    const elements = document.querySelectorAll(selector);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transition = `all ${duration}ms ease ${delay}ms`;
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translate(0, 0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => {
        el.style.opacity = '0';
        let x = 0, y = 0;
        if (origin === 'top') y = `-${distance}`;
        if (origin === 'bottom') y = distance;
        if (origin === 'left') x = `-${distance}`;
        if (origin === 'right') x = distance;

        el.style.transform = `translate(${x}, ${y})`;
        observer.observe(el);
    });
};

// Initialize reveals
window.addEventListener('DOMContentLoaded', () => {
    scrollReveal('.home-content, .heading, .about-text', 'top', '50px', 600, 50);
    scrollReveal('.home-img, .skills-container, .projects-box, .contact form, .about-stats', 'bottom', '50px', 600, 50);

    /* ========== Skill Bar Animation ========== */
    const skillBars = document.querySelectorAll('.bar-fill');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetWidth = entry.target.style.width;
                entry.target.style.width = '0';
                setTimeout(() => {
                    entry.target.style.width = targetWidth;
                }, 50);
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => skillObserver.observe(bar));
});

// ========== PROJECTS FILTER & SEARCH ==========

class ProjectFilter {
    constructor() {
        this.projectCards = document.querySelectorAll('.projects-box');
        this.activeFilters = new Set(['all']);
        this.searchTerm = '';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });

        // Search input
        const searchInput = document.getElementById('project-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Escape') {
                    searchInput.value = '';
                    this.handleSearch();
                }
            });
        }
    }

    handleFilterClick(e) {
        const btn = e.currentTarget;
        const filter = btn.getAttribute('data-filter');

        // Toggle "all" filter
        if (filter === 'all') {
            this.activeFilters.clear();
            this.activeFilters.add('all');
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
        } else {
            // Remove 'all' if another filter is selected
            this.activeFilters.delete('all');

            if (this.activeFilters.has(filter)) {
                this.activeFilters.delete(filter);
            } else {
                this.activeFilters.add(filter);
            }

            // Update button states
            document.querySelectorAll('.filter-btn').forEach(b => {
                const f = b.getAttribute('data-filter');
                if (f === 'all') {
                    b.classList.toggle('active', this.activeFilters.size === 0);
                } else {
                    b.classList.toggle('active', this.activeFilters.has(f));
                }
            });

            // If no filters, show all
            if (this.activeFilters.size === 0) {
                this.activeFilters.add('all');
                document.querySelector('[data-filter="all"]').classList.add('active');
            }
        }

        this.applyFilters();
    }

    handleSearch(e) {
        const searchInput = document.getElementById('project-search');
        this.searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        this.applyFilters();
    }

    applyFilters() {
        let visibleCount = 0;

        this.projectCards.forEach((card, index) => {
            const technologies = card.getAttribute('data-technologies').split(',');
            const keywords = card.getAttribute('data-search-keywords').toLowerCase();
            const title = card.querySelector('.projects-content h3').textContent.toLowerCase();

            // Check technology filter
            let matchesTech = false;
            if (this.activeFilters.has('all')) {
                matchesTech = true;
            } else {
                matchesTech = technologies.some(tech => this.activeFilters.has(tech.trim()));
            }

            // Check search term
            const matchesSearch = !this.searchTerm ||
                                  title.includes(this.searchTerm) ||
                                  keywords.includes(this.searchTerm);

            const shouldShow = matchesTech && matchesSearch;

            if (shouldShow) {
                card.classList.remove('hidden');
                card.classList.add('filtered-in');
                card.style.animationDelay = `${visibleCount * 0.1}s`;
                visibleCount++;
            } else {
                card.classList.add('hidden');
                card.classList.remove('filtered-in');
            }
        });

        // Show "no results" message if needed
        this.handleNoResults(visibleCount);
    }

    handleNoResults(visibleCount) {
        let noResultsMsg = document.querySelector('.no-projects-message');

        if (visibleCount === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-projects-message';
                noResultsMsg.innerHTML = `
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <p>No projects match your filters. Try adjusting your search!</p>
                `;
                document.querySelector('.projects-container').parentElement.insertBefore(
                    noResultsMsg,
                    document.querySelector('.projects-container')
                );
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
    new ProjectFilter();

    /* ========== Skill Bar Animation ========== */
    const skillBars = document.querySelectorAll('.bar-fill');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetWidth = entry.target.style.width;
                entry.target.style.width = '0';
                setTimeout(() => {
                    entry.target.style.width = targetWidth;
                }, 50);
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => skillObserver.observe(bar));

    /* ========== Form Validation & Feedback ========== */
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            const firstName = contactForm.querySelector('input[name="firstName"]').value.trim();
            const lastName = contactForm.querySelector('input[name="lastName"]').value.trim();
            const email = contactForm.querySelector('input[name="email"]').value.trim();
            const message = contactForm.querySelector('textarea[name="message"]').value.trim();

            // Basic validation
            if (!firstName || !lastName || !email || !message) {
                e.preventDefault();
                showFormStatus('Please fill in all required fields.', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                e.preventDefault();
                showFormStatus('Please enter a valid email address.', 'error');
                return;
            }

            // Disable button during submission
            const submitBtn = contactForm.querySelector('.btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        });
    }
});



/* ========== Show Form Status ========== */
function showFormStatus(message, type) {
    let statusDiv = document.querySelector('.form-status');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.className = 'form-status';
        document.querySelector('form').appendChild(statusDiv);
    }

    statusDiv.textContent = message;
    statusDiv.classList.remove('success', 'error');
    statusDiv.classList.add(type);

    setTimeout(() => {
        statusDiv.classList.remove('success', 'error');
    }, 5000);
}
