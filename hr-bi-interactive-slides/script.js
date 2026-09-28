document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressBar = document.getElementById('progressBar');
  const slideCounter = document.getElementById('slideCounter');
  const fsBtn = document.getElementById('fsBtn');
  const zoneLeft = document.getElementById('zoneLeft');
  const zoneRight = document.getElementById('zoneRight');
  
  let currentSlideIndex = 0;

  // Initialize specific slide animations
  initSlide16Icons();

  function updateSlides() {
    slides.forEach((slide, index) => {
      slide.classList.remove('active', 'prev-slide');
      
      // Reset reveals when leaving slide
      if (index !== currentSlideIndex) {
        const reveals = slide.querySelectorAll('.reveal-item');
        reveals.forEach(r => r.classList.remove('revealed'));
        
        // Reset counters
        const counters = slide.querySelectorAll('.count-up');
        counters.forEach(c => c.textContent = "0");
        
        // Reset slide 16
        if(slide.querySelector('.chart-container')) {
           slide.querySelector('.chart-container').classList.remove('chart-revealed');
           const icons = slide.querySelectorAll('.person-icon');
           icons.forEach(i => i.classList.remove('revealed'));
        }
      }

      if (index === currentSlideIndex) {
        slide.classList.add('active');
        
        // Trigger counters if this slide has them and they haven't been revealed
        const counters = slide.querySelectorAll('.count-up');
        if(counters.length > 0) {
           // Wait slightly for slide transition before counting
           setTimeout(() => {
              counters.forEach(runCounter);
           }, 500);
        }

      } else if (index < currentSlideIndex) {
        slide.classList.add('prev-slide');
      }
    });

    updateProgress();
  }

  function updateProgress() {
    const progress = ((currentSlideIndex) / (slides.length - 1)) * 100;
    progressBar.style.width = `${progress}%`;
    slideCounter.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
  }

  // Next Step / Reveal Logic
  function handleNext() {
    const activeSlide = slides[currentSlideIndex];
    const unrevealedItems = activeSlide.querySelectorAll('.reveal-item:not(.revealed)');
    
    // Custom logic for Slide 16 animation
    if(currentSlideIndex === 15) { // 0-indexed, slide 16
      const unrevealedIcons = activeSlide.querySelectorAll('.person-icon:not(.revealed)');
      if(unrevealedIcons.length > 0) {
        // Reveal icons sequentially
        unrevealedIcons.forEach((icon, i) => {
          setTimeout(() => {
            icon.classList.add('revealed');
          }, i * 150);
        });
        // Scale chart
        setTimeout(() => {
          activeSlide.querySelector('.chart-container').classList.add('chart-revealed');
        }, unrevealedIcons.length * 150 + 500);
        return; // Don't proceed to next slide yet
      }
    }

    if (unrevealedItems.length > 0) {
      // Reveal the next item(s) on the current slide
      unrevealedItems[0].classList.add('revealed');
    } else {
      // Move to next slide
      if (currentSlideIndex < slides.length - 1) {
        currentSlideIndex++;
        updateSlides();
      }
    }
  }

  function handlePrev() {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      updateSlides();
    }
  }

  // Events
  nextBtn.addEventListener('click', handleNext);
  prevBtn.addEventListener('click', handlePrev);
  zoneRight.addEventListener('click', handleNext);
  zoneLeft.addEventListener('click', handlePrev);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      handleNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      handlePrev();
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullScreen();
    }
  });

  fsBtn.addEventListener('click', toggleFullScreen);

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // --- Specific Slide Helpers ---
  
  // Slide 9 Counter Animation
  function runCounter(el) {
    const target = +el.getAttribute('data-target');
    const duration = 1000; // ms
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        el.textContent = Math.ceil(current).toLocaleString();
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = target.toLocaleString();
      }
    };
    updateCounter();
  }

  // Slide 16 inject people icons
  function initSlide16Icons() {
    const container = document.getElementById('peopleIcons');
    if(!container) return;
    
    const svgIcon = `<svg class="person-icon" viewBox="0 0 24 24"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/></svg>`;
    
    // Inject 8 icons
    for(let i = 0; i < 8; i++) {
       container.innerHTML += svgIcon;
    }
  }

  // Initial setup
  updateSlides();
});
