// Mobile Menu
const hamburger = document.getElementById('hamburger');
const navOverlay = document.getElementById('nav-overlay');
const navLinks = document.getElementById('nav-links');
const navLinkItems = document.querySelectorAll('.nav-link');

function toggleMenu() {
    const isHidden = navOverlay.classList.contains('hidden');
    if (isHidden) {
        navOverlay.classList.remove('hidden');
        // subtle delay to allow display:block to apply before transition
        setTimeout(() => {
            navOverlay.classList.remove('translate-x-[150%]');
            navOverlay.classList.add('translate-x-0');
            navLinks.classList.remove('translate-x-[150%]');
            navLinks.classList.add('translate-x-0');
        }, 10);
    } else {
        navOverlay.classList.remove('translate-x-0');
        navOverlay.classList.add('translate-x-[150%]');
        navLinks.classList.remove('translate-x-0');
        navLinks.classList.add('translate-x-[150%]');
        setTimeout(() => {
            navOverlay.classList.add('hidden');
        }, 300);
    }
}

if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
    navOverlay.addEventListener('click', toggleMenu);
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) { // Only on mobile
                toggleMenu();
            }
        });
    });
}

// Carousel Logic
class Carousel {
    constructor(trackId, prevId, nextId, itemSelector) {
        this.track = document.getElementById(trackId);
        this.prevBtn = document.getElementById(prevId);
        this.nextBtn = document.getElementById(nextId);
        this.items = this.track ? this.track.querySelectorAll(itemSelector) : [];

        this.offset = 0;
        this.transform = 0;
        this.capacity = 3; // Default capacity
        this.desiredCapacity = 3;

        this.init();
    }

    init() {
        if (!this.track) return;

        this.updateCapacity();
        window.addEventListener('resize', () => this.updateCapacity());

        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.scroll(1));
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.scroll(-1));

        this.updateControls();
    }

    updateCapacity() {
        const width = window.innerWidth;
        if (width <= 810) this.capacity = 1;
        else if (width <= 1200) this.capacity = 2;
        else this.capacity = 3; // Or derived from constructor if needed to be flexible

        // Update item widths based on capacity if needed, but Tailwind handles responsiveness mostly.
        // However, generic carousel needs to know how much to shift.
        // In the React code: width: ${100 / capacity}%
        // Here we rely on Tailwind classes w-full, md:w-1/2, lg:w-1/3 which matches 1, 2, 3.
        // So we just need to ensure our shift logic matches.

        // Re-clamp offset if capacity changed
        // if (this.offset < this.capacity - this.items.length) {
        //      this.offset = this.capacity - this.items.length;
        //      this.transform = this.offset * (100 / this.capacity);
        //      this.track.style.transform = `translateX(${this.transform}%)`;
        // }

        this.updateControls();
    }

    scroll(direction) {
        // direction: next: -1, prev: +1
        // checks boundaries
        if (direction === -1 && this.offset + direction < this.capacity - this.items.length) return;
        if (direction === 1 && this.offset + direction > 0) return;

        this.transform += direction * (100 / this.capacity);
        this.offset += direction;

        this.track.style.transform = `translateX(${this.transform}%)`;
        this.updateControls();
    }

    updateControls() {
        if (this.prevBtn) {
            if (this.offset === 0) this.prevBtn.classList.add('hidden');
            else this.prevBtn.classList.remove('hidden');
        }
        if (this.nextBtn) {
            if (this.capacity > this.items.length || this.offset === this.capacity - this.items.length) this.nextBtn.classList.add('hidden');
            else this.nextBtn.classList.remove('hidden');
        }
    }
}

// Initialize Carousels
// Projects Carousel
// Need to ensure capacity logic matches CSS breakpoints:
// sm: w-full (1), md: w-1/2 (2), lg: w-1/3 (3)
new Carousel('projects-track', 'projects-prev', 'projects-next', '#projects-track > div');

// Skills Carousel
// CSS: w-1/3 (3), md: w-1/5 (5), lg: w-[14.28%] (7)
// We need a subclass or config to handle different capacities.
class SkillsCarousel extends Carousel {
    updateCapacity() {
        const width = window.innerWidth;
        // Logic matching Tailwind classes in skills section
        if (width < 768) this.capacity = 3;
        else if (width < 1024) this.capacity = 5;
        else this.capacity = 7;

        this.updateControls();
    }
}

new SkillsCarousel('skills-track', 'skills-prev', 'skills-next', '#skills-track > div');
