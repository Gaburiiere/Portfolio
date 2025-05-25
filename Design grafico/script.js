document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let currentSection = null;
    let galleryItems = [];
    let currentItemIndex = 0;
    
    // DOM elements
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const revealElements = document.querySelectorAll('.reveal');
    const galleryElements = document.querySelectorAll('.gallery-item');
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalCaption = document.querySelector('.modal-caption');
    const closeModal = document.querySelector('.close-modal');
    const prevButton = document.querySelector('.modal-prev');
    const nextButton = document.querySelector('.modal-next');
    
    // Theme Toggle Function
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    }
    
    // Check for saved theme preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // Event Listeners
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Mobile Menu Toggle
    mobileMenuBtn.addEventListener('click', function() {
        navLinksContainer.classList.toggle('active');
        
        // Toggle between menu and close icons
        const icon = this.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = navLinksContainer.contains(event.target) || 
                              mobileMenuBtn.contains(event.target);
        
        if (!isClickInside && navLinksContainer.classList.contains('active')) {
            navLinksContainer.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Active link highlighting on scroll
    function updateActiveLink() {
        const scrollPosition = window.scrollY;
        
        // Determine which section is in view
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                const id = section.getAttribute('id');
                
                // Only update if needed
                if (currentSection !== id) {
                    currentSection = id;
                    
                    // Remove active class from all links
                    navLinks.forEach(link => link.classList.remove('active'));
                    
                    // Add active class to corresponding link
                    const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            }
        });
    }
    
    // Scroll animation for elements
    function checkReveal() {
        const triggerBottom = window.innerHeight * 0.8;
        
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                element.classList.add('active');
            }
        });
    }
    
    // Initialize gallery modal functionality
    function initGallery() {
        galleryItems = Array.from(galleryElements);
        
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => openModal(index));
        });
        
        closeModal.addEventListener('click', () => closeGalleryModal());
        
        // Close modal with escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeGalleryModal();
            if (e.key === 'ArrowLeft') navigateGallery(-1);
            if (e.key === 'ArrowRight') navigateGallery(1);
        });
        
        prevButton.addEventListener('click', () => navigateGallery(-1));
        nextButton.addEventListener('click', () => navigateGallery(1));
        
        // Close when clicking outside the image
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeGalleryModal();
        });
    }
    
    function openModal(index) {
        currentItemIndex = index;
        const item = galleryItems[index];
        const imgSrc = item.getAttribute('data-src') || item.querySelector('img').src;
        const imgAlt = item.querySelector('img').alt;
        
        modalImage.src = imgSrc;
        modalCaption.textContent = imgAlt;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function closeGalleryModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    function navigateGallery(direction) {
        currentItemIndex = (currentItemIndex + direction + galleryItems.length) % galleryItems.length;
        openModal(currentItemIndex);
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (navLinksContainer.classList.contains('active')) {
                navLinksContainer.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Event listeners for scroll
    window.addEventListener('scroll', () => {
        updateActiveLink();
        checkReveal();
    });
    
    // Initialize functions
    updateActiveLink();
    checkReveal();
    initGallery();
    
    // Header animation
    const headerElements = document.querySelectorAll('header .reveal');
    setTimeout(() => {
        headerElements.forEach(el => el.classList.add('active'));
    }, 500);
});