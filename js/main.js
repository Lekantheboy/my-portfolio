// =============== Navigation Toggle ===============
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// =============== Smooth Scrolling ===============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        navLinks.classList.remove('active');
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// =============== Counter Animation ===============
const counters = document.querySelectorAll('.counter');
let hasAnimated = false;

function animateCounter(counter) {
    const target = parseInt(counter.getAttribute('data-target'));
    let current = 0;
    const increment = target / 50; // Adjust this value to change animation speed

    const updateCounter = () => {
        if (current < target) {
            current += increment;
            counter.textContent = `${Math.floor(current)}+`;
            requestAnimationFrame(updateCounter);
        } else {
            counter.textContent = `${target}+`; // Add plus sign to final number
        }
    };

    updateCounter();
}


// =============== Intersection Observer ===============
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Add animation class for all sections
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            
            // Start counter animation if it's the stats section
            if (entry.target.classList.contains('stats') && !hasAnimated) {
                counters.forEach(counter => animateCounter(counter));
                hasAnimated = true;
            }
        }
    });
}, observerOptions);

// Observe all sections for general animations
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Observe stats section for counter animation
const statsSection = document.querySelector('.stats');
if (statsSection) {
    observer.observe(statsSection);
}

// =============== Form Submission ===============
const form = document.querySelector('.contact-form');
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: new FormData(this),
                headers: {
                    'Accept': 'application/json'
                },
            });
            
            if (response.ok) {
                // Success
                form.reset();
                alert('Message sent successfully!');
            } else {
                // Error
                const data = await response.json();
                if (data.errors) {
                    alert(data.errors.map(error => error.message).join(', '));
                } else {
                    alert('Error sending message. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending message. Please try again.');
        }
    });
}

// =============== Window Load Event ===============
window.addEventListener('load', () => {
    // Check if stats section is already in view on page load
    const statsRect = statsSection?.getBoundingClientRect();
    if (statsRect && statsRect.top < window.innerHeight && !hasAnimated) {
        counters.forEach(counter => animateCounter(counter));
        hasAnimated = true;
    }
});