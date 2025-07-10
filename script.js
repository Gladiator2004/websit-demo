// Elements
const introText = document.getElementById('intro-text');
const introBg = document.getElementById('intro-bg');
const slides = document.querySelectorAll('.bg-slide');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.snap-section');
const navbar = document.getElementById('navbar');
const navbarBrand = document.getElementById('navbar-brand');

let current = 0;

// Function to reset and restart the landing animation
function restartLandingAnimation() {
    // Reset scroll lock
    document.body.classList.add('no-scroll');
    
    // Reset intro text
    const introTextEl = document.getElementById('intro-text');
    if (introTextEl) {
        introTextEl.classList.remove('fade-out');
        introTextEl.style.opacity = '1';
        introTextEl.style.visibility = 'visible';
    }
    
    // Check if intro background exists, if not recreate it
    let introBgEl = document.getElementById('intro-bg');
    if (!introBgEl) {
        // Recreate the intro background element
        introBgEl = document.createElement('div');
        introBgEl.className = 'intro-bg';
        introBgEl.id = 'intro-bg';
        
        // Insert it in the correct position (after intro-text, before bg-slides)
        const backgroundContainer = document.querySelector('.background-container');
        const firstBgSlide = backgroundContainer.querySelector('.bg-slide');
        backgroundContainer.insertBefore(introBgEl, firstBgSlide);
        
        // Update global reference
        window.introBg = introBgEl;
    }
    
    // Reset intro background
    if (introBgEl) {
        introBgEl.classList.remove('visible');
        introBgEl.style.opacity = '1';
        introBgEl.style.transform = '';
    }
    
    // Hide navbar
    navbar.classList.add('hidden');
    
    // Get current slides (in case DOM has changed)
    const currentSlides = document.querySelectorAll('.bg-slide');
    
    // Reset slides
    currentSlides.forEach(slide => {
        slide.classList.remove('active', 'prev', 'next');
        slide.style.transform = 'translateX(-50%) translateX(200%)';
        slide.style.opacity = '0';
        slide.style.visibility = 'hidden';
    });
    
    // Reset current slide index
    current = 0;
    
    // Remove scroll event listener temporarily
    window.removeEventListener('scroll', handleScrollSpy);
    
    // Clear any existing timeouts and restart the animation sequence
    setTimeout(() => {
        // Step 1: Fade out intro text, fade in zoomed BG
        introTextEl.classList.add('fade-out');
        introBgEl.classList.add('visible');
        
        // Re-add the transition end listener for the intro background
        introBgEl.addEventListener('transitionend', function handleTransitionEnd(e) {
            if (e.propertyName === 'transform') {
                introBgEl.removeEventListener('transitionend', handleTransitionEnd);
                startCrossfade();
                introBgEl.style.opacity = '0';
                
                setTimeout(() => {
                    if (introBgEl.parentNode) {
                        introBgEl.remove();
                    }
                    document.body.classList.remove('no-scroll');
                }, 2000);
                
                // Restart scroll spy
                window.addEventListener('scroll', handleScrollSpy);
            }
        });
    }, 2500);
}

// Navbar brand click handler to restart landing page
navbarBrand.addEventListener('click', () => {
    // If in project detail view, close it first
    const projectDetailPage = document.getElementById('project-detail');
    if (projectDetailPage && !projectDetailPage.classList.contains('hidden')) {
        closeProjectDetail();
        
        // Wait for close animation to complete, then restart
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            restartLandingAnimation();
        }, 2000);
    } else {
        // Scroll to top and restart animation
        window.scrollTo({ top: 0, behavior: 'instant' });
        restartLandingAnimation();
    }
    
    // Update active nav link
    navLinks.forEach(link => link.classList.remove('active'));
    const homeLink = document.querySelector('[href="#intro"]');
    if (homeLink) homeLink.classList.add('active');
});

// Disable scroll on load
document.body.classList.add('no-scroll');

// Step 1: Fade out intro text, fade in zoomed BG
setTimeout(() => {
  introText.classList.add('fade-out');   // text starts fading out
  introBg.classList.add('visible');      // background zooms in
}, 2500);   // ⇦ gives the text ~1.5 s extra on screen


// Step 2: After zoom completes
introBg.addEventListener('transitionend', (e) => {
  if (e.propertyName === 'transform') {
    startCrossfade();
    introBg.style.opacity = '0';

    // After fade out
    setTimeout(() => {
      introBg.remove();
      document.body.classList.remove('no-scroll');
    }, 2000);

    // Start scroll spy
    window.addEventListener('scroll', handleScrollSpy);
  }
});

// Enhanced slideshow initialization with sequential loading
function startCrossfade() {
  const totalSlides = slides.length;

  // Preload slides and ensure proper positioning
  slides.forEach(slide => {
    slide.classList.remove('active', 'prev', 'next');
    slide.style.transition = 'none'; // Disable transitions during initialization
    slide.style.transform = 'translateX(-50%) translateX(200%)'; // Position off-screen
    slide.style.opacity = '0'; // Initially hidden
    slide.style.visibility = 'hidden';
  });

  // Force a reflow to ensure styles are applied
  slides[0].offsetHeight;

  // Calculate indices for sequential loading
  const prevIndex = (current - 1 + totalSlides) % totalSlides;
  const nextIndex = (current + 1) % totalSlides;
  
  // Get responsive positioning values
  const positions = getResponsivePositions();

  // Sequential loading: Left (prev), then Middle (current), then Right (next)
  setTimeout(() => {
    // Step 1: Load left slide (prev)
    slides[prevIndex].style.visibility = 'visible';
    slides[prevIndex].classList.add('prev');
    slides[prevIndex].style.transition = 'transform 1.2s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 1.2s ease-out, scale 1.2s ease-out';
    slides[prevIndex].style.transform = `translateX(-50%) translateX(${positions.prev}%)`;
    slides[prevIndex].style.opacity = '0.6';
    slides[prevIndex].style.scale = positions.scale;

    setTimeout(() => {
      // Step 2: Load middle slide (current/active)
      slides[current].style.visibility = 'visible';
      slides[current].classList.add('active');
      slides[current].style.transition = 'transform 1.2s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 1.2s ease-out, scale 1.2s ease-out';
      slides[current].style.transform = 'translateX(-50%) translateX(0%)';
      slides[current].style.opacity = '1';
      slides[current].style.scale = '1';

      setTimeout(() => {
        // Step 3: Load right slide (next)
        slides[nextIndex].style.visibility = 'visible';
        slides[nextIndex].classList.add('next');
        slides[nextIndex].style.transition = 'transform 1.2s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 1.2s ease-out, scale 1.2s ease-out';
        slides[nextIndex].style.transform = `translateX(-50%) translateX(${positions.next}%)`;
        slides[nextIndex].style.opacity = '0.6';
        slides[nextIndex].style.scale = positions.scale;

        // Step 4: Start the normal slideshow loop after all slides are loaded
        setTimeout(() => {
          startNormalSlideshow();
        }, 1500); // Wait 1.5 seconds after the last slide loads
      }, 200); // 200ms delay between middle and right
    }, 200); // 200ms delay between left and middle
  }, 500); // 500ms delay before starting the sequence
}

// Normal slideshow loop function
function startNormalSlideshow() {
  setInterval(() => {
    // Store previous current for smooth transitions
    const prevCurrent = current;
    
    // Move to next slide
    current = (current + 1) % slides.length;
    
    // Handle the transition
    performSlideTransition(prevCurrent, current);
    
  }, 6000); // 6 seconds between transitions
}

// Perform slide transition with proper animation
function performSlideTransition(fromIndex, toIndex) {
  const totalSlides = slides.length;
  
  // Calculate new positions
  const newPrevIndex = (toIndex - 1 + totalSlides) % totalSlides;
  const newNextIndex = (toIndex + 1) % totalSlides;
  
  // Get responsive positioning values
  const positions = getResponsivePositions();
  
  // First, move slides that need to exit to hidden positions
  slides.forEach((slide, index) => {
    if (index !== toIndex && index !== newPrevIndex && index !== newNextIndex) {
      slide.classList.remove('active', 'prev', 'next');
      slide.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
      slide.style.transform = 'translateX(-50%) translateX(200%)';
      slide.style.opacity = '0';
      slide.style.visibility = 'hidden';
    }
  });
  
  // Then position the three visible slides
  setTimeout(() => {
    // Clear all classes first
    slides.forEach(slide => {
      slide.classList.remove('active', 'prev', 'next');
    });
    
    // Set up the new active slide (center)
    slides[toIndex].classList.add('active');
    slides[toIndex].style.visibility = 'visible';
    slides[toIndex].style.transition = 'transform 1.2s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 1.2s ease-out, scale 1.2s ease-out';
    slides[toIndex].style.transform = 'translateX(-50%) translateX(0%)';
    slides[toIndex].style.opacity = '1';
    slides[toIndex].style.scale = '1';
    
    // Set up the previous slide (left)
    slides[newPrevIndex].classList.add('prev');
    slides[newPrevIndex].style.visibility = 'visible';
    slides[newPrevIndex].style.transition = 'transform 1.2s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 1.2s ease-out, scale 1.2s ease-out';
    slides[newPrevIndex].style.transform = `translateX(-50%) translateX(${positions.prev}%)`;
    slides[newPrevIndex].style.opacity = '0.6';
    slides[newPrevIndex].style.scale = positions.scale;
    
    // Set up the next slide (right)
    slides[newNextIndex].classList.add('next');
    slides[newNextIndex].style.visibility = 'visible';
    slides[newNextIndex].style.transition = 'transform 1.2s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 1.2s ease-out, scale 1.2s ease-out';
    slides[newNextIndex].style.transform = `translateX(-50%) translateX(${positions.next}%)`;
    slides[newNextIndex].style.opacity = '0.6';
    slides[newNextIndex].style.scale = positions.scale;
    
  }, 100); // Small delay to ensure smooth transition
}

// Get responsive positioning values based on screen size
function getResponsivePositions() {
  const screenWidth = window.innerWidth;
  
  if (screenWidth <= 480) {
    // Mobile
    return {
      prev: -100,
      next: 100,
      scale: '0.5'
    };
  } else if (screenWidth <= 768) {
    // Tablet
    return {
      prev: -95,
      next: 95,
      scale: '0.6'
    };
  } else {
    // Desktop
    return {
      prev: -85,
      next: 85,
      scale: '0.7'
    };
  }
}

// Scroll spy & navbar toggle
function handleScrollSpy() {
  let scrollY = window.scrollY;
  let introSection = document.getElementById('intro');
  let showNavbar = scrollY > introSection.offsetHeight * 0.8;

  // Toggle navbar visibility
  if (showNavbar) {
    navbar.classList.remove('hidden');
  } else {
    navbar.classList.add('hidden');
  }

  // Active link highlight
  sections.forEach((section) => {
    const offset = section.offsetTop - 100;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= offset && scrollY < offset + height) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}
// Lightbox functionality
const galleryImages = document.querySelectorAll('.gallery-img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

galleryImages.forEach((img) => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.style.display = 'flex';
  });
});

lightboxClose.addEventListener('click', () => {
  lightbox.style.display = 'none';
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    lightbox.style.display = 'none';
  }
});

// Sliding Image Track functionality
const track = document.getElementById("image-track");
const projectsContainer = document.querySelector(".projects-container");
const slideFriction = 1;
let isDragging = false;

if (track) {
    // Mouse events for sliding - improved to not interfere with clicks
    let mouseStartX = 0;
    let mouseHasMoved = false;
    
    window.addEventListener('mousedown', (e) => {
        // Only handle mouse events on the image track
        if (e.target.closest('#image-track')) {
            mouseStartX = e.clientX;
            mouseHasMoved = false;
            track.dataset.mouseDownAt = e.clientX;
            // Don't set isDragging immediately - wait for movement
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (track.dataset.mouseDownAt === "0") return;
        
        const deltaX = Math.abs(e.clientX - mouseStartX);
        // If moved more than 5px, consider it a drag
        if (deltaX > 5 && !mouseHasMoved) {
            mouseHasMoved = true;
            isDragging = true;
            // Add dragging classes to hide overlays and instruction
            if (projectsContainer) {
                projectsContainer.classList.add('dragging');
            }
            if (track) {
                track.classList.add('sliding');
            }
        }
        
        if (!isDragging) return;

        const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX;
        const maxDelta = window.innerWidth * slideFriction;

        const percentage = -(mouseDelta / maxDelta) * 100;
        const nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage || 0) + percentage;
        const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

        track.dataset.percentage = nextPercentage;

        track.animate(
            {
                transform: `translate(${nextPercentage}%, -50%)`
            }, 
            {
                duration: 1200, 
                fill: "forwards"
            }
        );

        for (const image of track.getElementsByClassName("image")) {
            image.animate(
                {
                    objectPosition: `${nextPercentage + 100}% 50%`
                }, 
                {
                    duration: 1200, 
                    fill: "forwards"
                }
            );
        }
    });

    window.addEventListener('mouseup', () => {
        if (track.dataset.mouseDownAt !== "0") {
            setTimeout(() => {
                isDragging = false;
                track.dataset.mouseDownAt = "0";
                track.dataset.prevPercentage = track.dataset.percentage || 0;
                mouseHasMoved = false;
                mouseStartX = 0;
                // Remove dragging classes
                if (projectsContainer) {
                    projectsContainer.classList.remove('dragging');
                }
                if (track) {
                    track.classList.remove('sliding');
                }
            }, 100); // Small delay to prevent click events immediately after drag
        }
    });

    // Touch events for mobile support
    let trackTouchStartX = 0;
    let trackTouchStartTime = 0;
    let trackHasMoved = false;
    
    window.addEventListener('touchstart', (e) => {
        // Handle touch on the entire track area
        if (e.target.closest('#image-track')) {
            trackTouchStartX = e.touches[0].clientX;
            trackTouchStartTime = Date.now();
            trackHasMoved = false;
            track.dataset.mouseDownAt = e.touches[0].clientX;
            // Don't set isDragging immediately - wait for movement
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (track.dataset.mouseDownAt === "0") return;
        
        const currentX = e.touches[0].clientX;
        const deltaX = Math.abs(currentX - trackTouchStartX);
        
        // If moved more than 10px, consider it a drag
        if (deltaX > 10 && !trackHasMoved) {
            trackHasMoved = true;
            isDragging = true;
            // Add dragging classes to hide overlays and instruction
            if (projectsContainer) {
                projectsContainer.classList.add('dragging');
            }
            if (track) {
                track.classList.add('sliding');
            }
            // Prevent any pending image tap actions
            document.querySelectorAll('.project-image').forEach(img => {
                img.classList.remove('touched');
            });
        }
        
        if (!isDragging) return;

        const mouseDelta = parseFloat(track.dataset.mouseDownAt) - currentX;
        const maxDelta = window.innerWidth * slideFriction;

        const percentage = -(mouseDelta / maxDelta) * 100;
        const nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage || 0) + percentage;
        const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

        track.dataset.percentage = nextPercentage;

        track.animate(
            {
                transform: `translate(${nextPercentage}%, -50%)`
            }, 
            {
                duration: 1200, 
                fill: "forwards"
            }
        );

        for (const image of track.getElementsByClassName("image")) {
            image.animate(
                {
                    objectPosition: `${nextPercentage + 100}% 50%`
                }, 
                {
                    duration: 1200, 
                    fill: "forwards"
                }
            );
        }
    });

    window.addEventListener('touchend', () => {
        if (track.dataset.mouseDownAt !== "0") {
            // Reset tracking variables
            setTimeout(() => {
                isDragging = false;
                track.dataset.mouseDownAt = "0";
                track.dataset.prevPercentage = track.dataset.percentage || 0;
                trackHasMoved = false;
                trackTouchStartX = 0;
                trackTouchStartTime = 0;
                // Remove dragging classes
                if (projectsContainer) {
                    projectsContainer.classList.remove('dragging');
                }
                if (track) {
                    track.classList.remove('sliding');
                }
            }, 150); // Slightly longer delay for touch
        }
    });
}

// Text scramble animation function
function animateTextScramble(element, finalText) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let iteration = 0;
    let interval = null;
    
    // Clear any existing interval
    clearInterval(interval);
    
    // Set the data attribute for the final text
    element.dataset.value = finalText;
    
    interval = setInterval(() => {
        element.innerText = finalText
            .split("")
            .map((letter, index) => {
                if (index < iteration) {
                    return finalText[index];
                }
                return letters[Math.floor(Math.random() * 26)];
            })
            .join("");
        
        if (iteration >= finalText.length) {
            clearInterval(interval);
        }
        
        iteration += 1 / 3;
    }, 30);
}

// Project Detail Page Functionality
const projectDetailPage = document.getElementById('project-detail');
const backBtn = document.getElementById('back-btn');
const projectHeroImg = document.getElementById('project-hero-img');
const projectTitle = document.getElementById('project-title');
const projectGallery = document.getElementById('project-gallery');

// Project data with detailed information
const projectData = {
    'solar-energy': {
        name: 'Waste Heat Recovery',
        heroImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        items: [
            {
                title: 'Industrial Heat Recovery Systems',
                image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
                stats: [
                    { number: '85%', label: 'Heat Recovery' },
                    { number: '20 Years', label: 'Lifespan' },
                    { number: '75MW', label: 'Thermal Output' }
                ]
            }
        ]
    },
    'wind-energy': {
        name: 'Rocket Control System',
        heroImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        items: [
            {
                title: 'Advanced Propulsion Control',
                image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
                stats: [
                    { number: '99.9%', label: 'Precision' },
                    { number: '5000m/s', label: 'Max Velocity' },
                    { number: '0.1ms', label: 'Response Time' }
                ]
            }
        ]
    },
    'hydroelectric': {
        name: 'Coming Soon',
        heroImage: 'https://images.unsplash.com/photo-1661956601031-4cf09efadfce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxNnx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80',
        items: [
            {
                title: 'Project in Development',
                image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
                stats: [
                    { number: 'TBD', label: 'Coming Soon' },
                    { number: 'TBD', label: 'Coming Soon' },
                    { number: 'TBD', label: 'Coming Soon' }
                ]
            }
        ]
    },
    'geothermal': {
        name: 'Coming Soon',
        heroImage: 'https://images.unsplash.com/photo-1677688010633-138cea460828?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyMHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80',
        items: [
            {
                title: 'Project in Development',
                image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
                stats: [
                    { number: 'TBD', label: 'Coming Soon' },
                    { number: 'TBD', label: 'Coming Soon' },
                    { number: 'TBD', label: 'Coming Soon' }
                ]
            }
        ]
    },
    'smart-grid': {
        name: 'Coming Soon',
        heroImage: 'https://images.unsplash.com/photo-1677618031630-768ddc4f4fad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyNHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80',
        items: [
            {
                title: 'Project in Development',
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
                stats: [
                    { number: 'TBD', label: 'Coming Soon' },
                    { number: 'TBD', label: 'Coming Soon' },
                    { number: 'TBD', label: 'Coming Soon' }
                ]
            }
        ]
    },
    'battery-storage': {
        name: 'Coming Soon',
        heroImage: 'https://images.unsplash.com/photo-1661956601349-f61c959a8fd4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwzMXx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80',
        items: [
            {
                title: 'Project in Development',
                image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
                stats: [
                    { number: 'TBD', label: 'Coming Soon' },
                    { number: 'TBD', label: 'Coming Soon' },
                    { number: 'TBD', label: 'Coming Soon' }
                ]
            }
        ]
    },
    'biomass-energy': {
        name: 'Coming Soon',
        heroImage: 'https://images.unsplash.com/photo-1677629828024-7793ff7d9403?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw1OHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80',
        items: [
            {
                title: 'Project in Development',
                image: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
                stats: [
                    { number: 'TBD', label: 'Coming Soon' },
                    { number: 'TBD', label: 'Coming Soon' },
                    { number: 'TBD', label: 'Coming Soon' }
                ]
            }
        ]
    }
};

// Handle project image clicks
function initializeProjectClicks() {
    const projectImages = document.querySelectorAll('.project-image');
    
    projectImages.forEach(img => {
        let touchStartTime = 0;
        let touchStartX = 0;
        let touchStartY = 0;
        let hasMoved = false;
        let touchTimeout = null;
        
        // Function to handle project opening
        function openProject() {
            const projectId = img.dataset.projectId;
            const clickedImageSrc = img.src;
            
            // Debug: Check if function is being called
            console.log('openProject called for:', projectId, 'Data exists:', !!projectData[projectId]);
            
            if (projectId && projectData[projectId]) {
                // Get the position and size of the clicked image
                const rect = img.getBoundingClientRect();
                const imageData = {
                    src: clickedImageSrc,
                    startRect: rect,
                    element: img
                };
                
                openProjectDetail(projectId, imageData);
                // Update URL without page reload
                history.pushState({ projectId }, '', `#${projectId}`);
            } else {
                console.log('Project not found - ID:', projectId, 'Available projects:', Object.keys(projectData));
            }
        }
        
        // Desktop mouse events - simplified for single click
        img.addEventListener('click', (e) => {
            console.log('Click detected - isDragging:', isDragging, 'hasMoved:', hasMoved);
            // Only handle if not dragging the track and the local mouse hasn't moved significantly
            if (!isDragging && !hasMoved) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Click accepted, calling openProject');
                openProject();
            } else {
                console.log('Click rejected - isDragging:', isDragging, 'hasMoved:', hasMoved);
            }
        });
        
        // Optional: Add mouse tracking only for drag detection (not click validation)
        img.addEventListener('mousedown', (e) => {
            touchStartTime = Date.now();
            touchStartX = e.clientX;
            touchStartY = e.clientY;
            hasMoved = false;
        });
        
        img.addEventListener('mousemove', (e) => {
            if (touchStartTime > 0) {
                const deltaX = Math.abs(e.clientX - touchStartX);
                const deltaY = Math.abs(e.clientY - touchStartY);
                if (deltaX > 15 || deltaY > 15) {
                    hasMoved = true;
                }
            }
        });
        
        img.addEventListener('mouseup', (e) => {
            // Reset movement tracking after a short delay
            setTimeout(() => {
                touchStartTime = 0;
                hasMoved = false;
            }, 50);
        });
        
        // Mobile touch events - simplified and more reliable
        img.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default touch behavior
            touchStartTime = Date.now();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            hasMoved = false;
            
            // Add visual feedback
            img.classList.add('touched');
            
            // Clear any existing timeout
            if (touchTimeout) {
                clearTimeout(touchTimeout);
                touchTimeout = null;
            }
        }, { passive: false });
        
        img.addEventListener('touchmove', (e) => {
            if (touchStartTime > 0) {
                const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
                const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
                if (deltaX > 15 || deltaY > 15) {
                    hasMoved = true;
                    // If significant horizontal movement, it might be track dragging
                    if (deltaX > 25) {
                        img.classList.remove('touched'); // Remove visual feedback
                    }
                }
            }
        });
        
        img.addEventListener('touchend', (e) => {
            e.preventDefault(); // Prevent default touch behavior
            const touchDuration = Date.now() - touchStartTime;
            
            // Remove visual feedback
            img.classList.remove('touched');
            
            // Check if it's a valid tap (not a swipe, not dragging track, and reasonable duration)
            if (!hasMoved && !isDragging && touchDuration < 500 && touchDuration > 50) {
                // Small delay to distinguish from potential double-tap
                touchTimeout = setTimeout(() => {
                    openProject();
                    touchTimeout = null;
                }, 100);
            }
            
            // Reset
            touchStartTime = 0;
            hasMoved = false;
        }, { passive: false });
        
        // Add hover effects for better UX (desktop only)
        img.addEventListener('mouseenter', () => {
            if (!isDragging && !('ontouchstart' in window)) {
                img.style.cursor = 'pointer';
                img.style.filter = 'brightness(1.1) saturate(1.2)';
                img.style.transform = 'scale(1.02)';
                img.style.transition = 'all 0.3s ease';
            }
        });
        
        img.addEventListener('mouseleave', () => {
            if (!('ontouchstart' in window)) {
                img.style.cursor = '';
                img.style.filter = '';
                img.style.transform = '';
                img.style.transition = '';
            }
        });
    });
}

// Open project detail page
function openProjectDetail(projectId, imageData = null) {
    const project = projectData[projectId];
    if (!project) return;
    
    // Hide back button initially
    backBtn.classList.remove('visible');
    
    // Use clicked image if provided, otherwise use preset hero
    const heroImageSrc = imageData ? imageData.src : project.heroImage;
    
    if (imageData && imageData.startRect) {
        // Store original image data for reverse animation
        projectDetailPage.dataset.originalImageData = JSON.stringify({
            top: imageData.startRect.top,
            left: imageData.startRect.left,
            width: imageData.startRect.width,
            height: imageData.startRect.height,
            projectId: projectId
        });
        
        // Hide the original image immediately
        imageData.element.style.opacity = '0';
        
        // Create smooth expansion animation from clicked image position
        const startRect = imageData.startRect;
        
        // Set up the modal but keep it invisible initially
        projectDetailPage.classList.remove('hidden');
        projectDetailPage.style.opacity = '1';
        document.body.style.overflow = 'hidden';
        
        // Set up the hero image to match clicked image exactly
        projectHeroImg.src = heroImageSrc;
        
        // Set project title as single string
        projectTitle.textContent = project.name;
        
        // Position hero image to match the clicked image exactly
        projectHeroImg.style.transition = 'none';
        projectHeroImg.style.position = 'fixed';
        projectHeroImg.style.top = startRect.top + 'px';
        projectHeroImg.style.left = startRect.left + 'px';
        projectHeroImg.style.width = startRect.width + 'px';
        projectHeroImg.style.height = startRect.height + 'px';
        projectHeroImg.style.objectFit = 'cover';
        projectHeroImg.style.borderRadius = '10px';
        projectHeroImg.style.zIndex = '3002';
        projectHeroImg.style.transform = 'scale(1)';
        projectHeroImg.style.filter = 'none';
        
        // Hide title and content initially
        document.querySelector('.project-title-overlay').style.opacity = '0';
        document.querySelector('.project-content').style.opacity = '0';
        document.querySelector('.project-content').style.transform = 'translateY(50px)';
        
        // Force a reflow to ensure positioning is applied
        projectHeroImg.offsetHeight;
        
        // Start the expansion animation
        setTimeout(() => {
            projectHeroImg.style.transition = 'all 1.8s cubic-bezier(0.16, 1, 0.3, 1)';
            projectHeroImg.style.top = '0px';
            projectHeroImg.style.left = '0px';
            projectHeroImg.style.width = '100vw';
            projectHeroImg.style.height = '100vh';
            projectHeroImg.style.borderRadius = '0';
            
            // After image expansion completes, animate in the texts
            setTimeout(() => {
                // Reset positioning first
                projectHeroImg.style.position = 'static';
                projectHeroImg.style.top = 'auto';
                projectHeroImg.style.left = 'auto';
                projectHeroImg.style.width = '100%';
                projectHeroImg.style.height = '100%';
                projectHeroImg.style.zIndex = 'auto';
                projectHeroImg.style.transition = '';
                projectHeroImg.style.transform = '';
                projectHeroImg.style.filter = '';
                projectHeroImg.style.borderRadius = '';
                
                // Show title and start scramble animation
                setTimeout(() => {
                    const titleOverlay = document.querySelector('.project-title-overlay');
                    const titleElement = titleOverlay.querySelector('.cyberpunk-title');
                    
                    titleOverlay.style.opacity = '1';
                    
                    // Start text scramble animation immediately
                    animateTextScramble(titleElement, project.name);
                }, 200);
                
                // Animate content in after title
                setTimeout(() => {
                    const content = document.querySelector('.project-content');
                    content.style.transition = 'opacity 1.0s ease, transform 1.0s cubic-bezier(0.16, 1, 0.3, 1)';
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0)';
                    
                    // Show back button after all animations complete
                    setTimeout(() => {
                        backBtn.classList.add('visible');
                    }, 500);
                }, 600);
                
            }, 1800);
        }, 50);
        
    } else {
        // Standard modal opening without animation
        projectDetailPage.classList.remove('hidden');
        projectHeroImg.src = heroImageSrc;
        
        // Set project title as single string
        projectTitle.textContent = project.name;
        
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            projectDetailPage.style.opacity = '1';
            
            const titleOverlay = document.querySelector('.project-title-overlay');
            const titleElement = titleOverlay.querySelector('.cyberpunk-title');
            const content = document.querySelector('.project-content');
            
            titleOverlay.style.opacity = '1';
            
            // Start text scramble animation immediately
            animateTextScramble(titleElement, project.name);
            
            content.style.transition = 'opacity 1.0s ease, transform 1.0s cubic-bezier(0.16, 1, 0.3, 1)';
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
            
            // Show back button after animations complete
            setTimeout(() => {
                backBtn.classList.add('visible');
            }, 1000);
        }, 50);
    }
    
    // Clear and populate gallery
    projectGallery.innerHTML = '';
    
    project.items.forEach((item, index) => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        
        const statsHTML = item.stats ? item.stats.map(stat => 
            `<div class="stat-box">
                <span class="number">${stat.number}</span>
                <span class="label">${stat.label}</span>
            </div>`
        ).join('') : '';
        
        projectItem.innerHTML = `
            <div class="project-text">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                ${statsHTML ? `<div class="project-stats">${statsHTML}</div>` : ''}
            </div>
            <img src="${item.image}" alt="${item.title}" class="project-image">
        `;
        
        projectGallery.appendChild(projectItem);
    });
}

// Close project detail page
function closeProjectDetail() {
    const originalImageData = projectDetailPage.dataset.originalImageData;
    
    if (originalImageData) {
        const imageData = JSON.parse(originalImageData);
        
        // First, animate out content and title with smooth transitions
        const content = document.querySelector('.project-content');
        const titleOverlay = document.querySelector('.project-title-overlay');
        
        content.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        content.style.opacity = '0';
        content.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            titleOverlay.style.transition = 'opacity 0.6s ease';
            titleOverlay.style.opacity = '0';
        }, 200);
        
        // Wait for content to fade, then start image contraction
        setTimeout(() => {
            // Hide back button before image contraction starts
            backBtn.classList.remove('visible');
            
            // Set up hero image for reverse animation
            const heroImg = projectHeroImg;
            
            // Reset to fullscreen fixed position
            heroImg.style.position = 'fixed';
            heroImg.style.top = '0px';
            heroImg.style.left = '0px';
            heroImg.style.width = '100vw';
            heroImg.style.height = '100vh';
            heroImg.style.objectFit = 'cover';
            heroImg.style.borderRadius = '0';
            heroImg.style.zIndex = '3002';
            heroImg.style.transition = 'none';
            
            // Force reflow
            heroImg.offsetHeight;
            
            // Animate back to original position
            setTimeout(() => {
                heroImg.style.transition = 'all 1.8s cubic-bezier(0.16, 1, 0.3, 1)';
                heroImg.style.top = imageData.top + 'px';
                heroImg.style.left = imageData.left + 'px';
                heroImg.style.width = imageData.width + 'px';
                heroImg.style.height = imageData.height + 'px';
                heroImg.style.borderRadius = '10px';
                
                // Fade out modal background during contraction
                setTimeout(() => {
                    projectDetailPage.style.opacity = '0';
                }, 1200);
                
                // Show original image and complete cleanup
                setTimeout(() => {
                    // Show the original image
                    const originalImg = document.querySelector(`[data-project-id="${imageData.projectId}"]`);
                    if (originalImg) {
                        originalImg.style.opacity = '1';
                    }
                    
                    // Complete cleanup
                    projectDetailPage.classList.add('hidden');
                    document.body.style.overflow = '';
                    
                    // Reset all hero image styles
                    heroImg.style.transition = '';
                    heroImg.style.position = '';
                    heroImg.style.top = '';
                    heroImg.style.left = '';
                    heroImg.style.width = '';
                    heroImg.style.height = '';
                    heroImg.style.zIndex = '';
                    heroImg.style.borderRadius = '';
                    heroImg.style.transform = '';
                    heroImg.style.filter = '';
                    heroImg.style.objectFit = '';
                    
                    // Ensure all project images are visible
                    document.querySelectorAll('.project-image').forEach(img => {
                        img.style.opacity = '1';
                    });
                    
                    // Reset text transforms
                    document.querySelector('.project-title-overlay').style.opacity = '0';
                    document.querySelector('.project-content').style.transform = '';
                    
                    // Clear stored data
                    delete projectDetailPage.dataset.originalImageData;
                }, 1800);
            }, 50);
        }, 800);
        
    } else {
        // Fallback close animation
        // Hide back button immediately
        backBtn.classList.remove('visible');
        
        const content = document.querySelector('.project-content');
        const titleOverlay = document.querySelector('.project-title-overlay');
        
        content.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        content.style.opacity = '0';
        content.style.transform = 'translateY(50px)';
        
        titleOverlay.style.transition = 'opacity 0.6s ease';
        titleOverlay.style.opacity = '0';
        
        projectDetailPage.style.opacity = '0';
        
        setTimeout(() => {
            projectDetailPage.classList.add('hidden');
            document.body.style.overflow = '';
            
            // Reset all styles
            const heroImg = projectHeroImg;
            heroImg.style.transition = '';
            heroImg.style.position = '';
            heroImg.style.top = '';
            heroImg.style.left = '';
            heroImg.style.width = '';
            heroImg.style.height = '';
            heroImg.style.zIndex = '';
            heroImg.style.borderRadius = '';
            heroImg.style.transform = '';
            heroImg.style.filter = '';
            heroImg.style.objectFit = '';
            
            document.querySelectorAll('.project-image').forEach(img => {
                img.style.opacity = '1';
            });
            
            // Reset text transforms
            document.querySelector('.project-title-overlay').style.opacity = '0';
            document.querySelector('.project-content').style.transform = '';
        }, 800);
    }
    
    // Update URL
    history.pushState({}, '', window.location.pathname);
}

// Back button event listener
backBtn.addEventListener('click', closeProjectDetail);

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.projectId) {
        openProjectDetail(e.state.projectId);
    } else {
        if (!projectDetailPage.classList.contains('hidden')) {
            closeProjectDetail();
        }
    }
});

// Handle direct URL access to projects
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash && projectData[hash]) {
        openProjectDetail(hash);
    }
});

// Initialize project clicks when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeProjectClicks();
});
