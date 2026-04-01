
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
    strings: ['Frontend Developer', 'Web Designer'],
    typeSpeed: 200,
    backSpeed: 200,
    backDelay: 200,
    loop: true
});

/* ========== Scroll Reveal (Simulated with Intersection Observer) ========== */
const scrollReveal = (selector, origin, distance = '80px', duration = 2000, delay = 200) => {
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
    scrollReveal('.home-content, .heading', 'top');
    scrollReveal('.home-img, .skills-container, .projects-box, .contact form', 'bottom');

    /* ========== Skill Bar Animation ========== */
    const skillBars = document.querySelectorAll('.bar-fill');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetWidth = entry.target.style.width;
                entry.target.style.width = '0';
                setTimeout(() => {
                    entry.target.style.width = targetWidth;
                }, 100);
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => skillObserver.observe(bar));
});

/* ========== Contact Form Submission ========== */
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        const submitBtn = contactForm.querySelector('input[type="submit"]');
        const originalBtnValue = submitBtn.value;
        submitBtn.value = "Sending...";
        submitBtn.disabled = true;

        try {
            const response = await fetch('https://portfolio-qxfs.onrender.com/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                contactForm.reset();
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to send message. Please make sure the backend server is running.");
        } finally {
            submitBtn.value = originalBtnValue;
            submitBtn.disabled = false;
        }
    });
}