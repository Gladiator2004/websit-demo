// Elements
const introText = document.getElementById('intro-text');
const introBg = document.getElementById('intro-bg');
const slides = document.querySelectorAll('.bg-slide');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.snap-section');
const navbar = document.getElementById('navbar');

let current = 0;

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
const slideFriction = 1;

if (track) {
    // Mouse events for sliding
    window.addEventListener('mousedown', (e) => {
        // Only handle mouse events on the image track
        if (e.target.closest('#image-track')) {
            track.dataset.mouseDownAt = e.clientX;
            e.preventDefault();
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (track.dataset.mouseDownAt === "0") return;

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
        track.dataset.mouseDownAt = "0";
        track.dataset.prevPercentage = track.dataset.percentage || 0;
    });

    // Touch events for mobile support
    window.addEventListener('touchstart', (e) => {
        if (e.target.closest('#image-track')) {
            track.dataset.mouseDownAt = e.touches[0].clientX;
            e.preventDefault();
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (track.dataset.mouseDownAt === "0") return;

        const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.touches[0].clientX;
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
        track.dataset.mouseDownAt = "0";
        track.dataset.prevPercentage = track.dataset.percentage || 0;
    });
}

