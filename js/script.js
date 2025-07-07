// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", function () {
  // Wave text animation
  createWaveTextAnimation();

  // Setup new navigation
  setupNavigation();

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Update active navigation links on scroll
  updateActiveNavOnScroll();

  // Water splash effect
  setupWaterSplash();

  // Mouse tracking for glass cards
  setupMouseTracking();

  // Initialize portfolio features if on portfolio page
  initPortfolioPage();

  // Scroll animations with improved timing
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Add staggered animation delay based on index
        const delay =
          Array.from(entry.target.parentElement.children).indexOf(
            entry.target
          ) * 0.1;
        entry.target.style.transitionDelay = `${delay}s`;
        entry.target.classList.add("animated");
      }
    });
  }, observerOptions);

  // Observe elements for animation with staggered effect
  const animatedElements = document.querySelectorAll(
    ".service-card, .portfolio-item-detailed, .testimonial-card, .fade-in, .metric-item"
  );
  animatedElements.forEach((el) => {
    el.classList.add("will-animate");
    observer.observe(el);
  });

  // Counter animation for stats
  const counters = document.querySelectorAll(".metric-number, .stat-item h3");
  const countObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const originalText = counter.textContent;
          const target = parseInt(originalText.replace(/[^\d]/g, ""));
          const hasPlus = originalText.includes("+");
          const hasPercent = originalText.includes("%");
          const increment = target / 80;
          let count = 0;

          const updateCount = () => {
            if (count < target) {
              count += increment;
              let displayNumber = Math.ceil(count);
              let suffix = "";

              if (hasPlus) suffix = "+";
              if (hasPercent) suffix = "%";

              counter.textContent = displayNumber + suffix;
              setTimeout(updateCount, 25);
            } else {
              counter.textContent = originalText; // Keep original text
            }
          };

          updateCount();
          countObserver.unobserve(counter);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => {
    countObserver.observe(counter);
  });

  // Enhanced parallax effect for hero section with dynamic text
  window.addEventListener("scroll", function () {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector(".hero");
    const heroVideo = document.querySelector(".hero-video");
    const heroOverlay = document.querySelector(".hero-overlay");
    const heroContent = document.querySelector(".hero-content");
    const scrollDown = document.querySelector(".scroll-down");

    if (hero && heroVideo) {
      // Improved parallax rate for smoother effect
      const rate = scrolled * -0.3;
      heroVideo.style.transform = `translateY(${rate}px) scale(${
        1 + scrolled * 0.0005
      })`;

      // Dynamic overlay opacity based on scroll
      const overlayOpacity = Math.min(0.75 + scrolled * 0.0005, 0.9);
      heroOverlay.style.background = `linear-gradient(135deg, rgba(0, 70, 93, ${overlayOpacity}), rgba(0, 140, 186, ${
        overlayOpacity * 0.85
      }))`;

      // Dynamic text transformation with subtle parallax
      if (heroContent) {
        const contentTransform = scrolled * 0.2;
        heroContent.style.transform = `translateY(${contentTransform}px)`;
        heroContent.style.opacity = Math.max(1 - scrolled * 0.002, 0);
      }

      // Hide scroll indicator when scrolling down
      if (scrollDown && scrolled > 100) {
        scrollDown.style.opacity = "0";
      } else if (scrollDown) {
        scrollDown.style.opacity = "1";
      }
    }

    // Parallax effect for other sections
    document
      .querySelectorAll(".parallax-section:not(.hero)")
      .forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const speed = section.dataset.speed || 0.15;
          const yPos = -(rect.top * speed);
          const backgroundPos = `50% ${yPos}px`;
          section.style.backgroundPosition = backgroundPos;
        }
      });
  });

  // Form validation (if contact form exists)
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(this);
      const name = formData.get("name");
      const email = formData.get("email");
      const phone = formData.get("phone");
      const message = formData.get("message");

      // Simple validation
      if (!name || !email || !message) {
        showAlert("Please fill in all required fields.", "error");
        return;
      }

      if (!isValidEmail(email)) {
        showAlert("Please enter a valid email address.", "error");
        return;
      }

      // Show success message
      showAlert(
        "Thank you for your message! We will get back to you soon.",
        "success"
      );

      // Reset form
      this.reset();
    });
  }

  // Add CSS for animations
  addAnimationStyles();
});

// Portfolio page initialization
function initPortfolioPage() {
  // Check if we're on the portfolio page
  const portfolioGrid = document.querySelector(".masonry-grid");
  if (!portfolioGrid) return;

  // Initialize masonry layout
  initMasonryLayout();

  // Initialize portfolio filtering
  initPortfolioFilters();

  // Initialize lightbox
  initLightbox();
}

// Initialize masonry layout
function initMasonryLayout() {
  const grid = document.querySelector(".masonry-grid");
  if (!grid) return;

  const items = grid.querySelectorAll(".portfolio-item-detailed");

  // Ensure all images load properly
  items.forEach((item) => {
    const img = item.querySelector("img");
    if (img) {
      img.onload = function () {
        // Image loaded successfully
        img.style.opacity = 1;
      };

      // If image is already loaded
      if (img.complete) {
        img.style.opacity = 1;
      } else {
        img.style.opacity = 0;
        img.style.transition = "opacity 0.3s ease";
      }
    }
  });

  // Initialize filtering with animation
  initPortfolioFilters();
}

// Initialize portfolio filtering
function initPortfolioFilters() {
  const filterButtons = document.querySelectorAll(".portfolio-filter-btn");
  const portfolioItems = document.querySelectorAll(".portfolio-item-detailed");

  if (!filterButtons.length || !portfolioItems.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Get filter value
      const filterValue = this.getAttribute("data-filter");

      // Filter items with animation
      portfolioItems.forEach((item) => {
        const categories = item.getAttribute("data-category").split(" ");

        if (filterValue === "all" || categories.includes(filterValue)) {
          item.style.opacity = "0";
          item.style.transform = "scale(0.95)";

          setTimeout(() => {
            item.style.display = "block";
            setTimeout(() => {
              item.style.opacity = "1";
              item.style.transform = "scale(1)";
            }, 50);
          }, 300);
        } else {
          item.style.opacity = "0";
          item.style.transform = "scale(0.95)";

          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    });
  });
}

// Initialize lightbox
function initLightbox() {
  const lightbox = document.querySelector(".portfolio-lightbox");
  const lightboxImg = lightbox ? lightbox.querySelector("img") : null;
  const lightboxTitle = lightbox
    ? lightbox.querySelector(".lightbox-title")
    : null;
  const lightboxDesc = lightbox
    ? lightbox.querySelector(".lightbox-description")
    : null;
  const lightboxMeta = lightbox
    ? lightbox.querySelector(".lightbox-meta")
    : null;
  const closeBtn = lightbox ? lightbox.querySelector(".lightbox-close") : null;
  const prevBtn = lightbox ? lightbox.querySelector(".lightbox-prev") : null;
  const nextBtn = lightbox ? lightbox.querySelector(".lightbox-next") : null;

  if (!lightbox || !lightboxImg) return;

  let currentIndex = 0;
  const portfolioItems = document.querySelectorAll(".portfolio-item-detailed");

  // Open lightbox when clicking on portfolio item buttons
  portfolioItems.forEach((item, index) => {
    const viewDetailsBtn = item.querySelector(
      '.portfolio-item-btn[aria-label="View Details"]'
    );
    const viewGalleryBtn = item.querySelector(
      '.portfolio-item-btn[aria-label="View Gallery"]'
    );

    if (viewDetailsBtn) {
      viewDetailsBtn.addEventListener("click", () => {
        openLightbox(item, index);
      });
    }

    if (viewGalleryBtn) {
      viewGalleryBtn.addEventListener("click", () => {
        openLightbox(item, index);
      });
    }

    // Also allow clicking on the image itself
    const itemImg = item.querySelector(".portfolio-item-img");
    if (itemImg) {
      itemImg.addEventListener("click", () => {
        openLightbox(item, index);
      });
    }
  });

  // Close lightbox
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  // Close lightbox with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
    }

    // Navigate with arrow keys
    if (lightbox.classList.contains("active")) {
      if (e.key === "ArrowLeft") {
        navigateLightbox("prev");
      } else if (e.key === "ArrowRight") {
        navigateLightbox("next");
      }
    }
  });

  // Navigate to previous item
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      navigateLightbox("prev");
    });
  }

  // Navigate to next item
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      navigateLightbox("next");
    });
  }

  // Open lightbox function
  function openLightbox(item, index) {
    currentIndex = index;

    // Get item details
    const img = item.querySelector("img");
    const title = item.querySelector(".portfolio-item-title");
    const category = item.querySelector(".portfolio-item-category");
    const info = item.querySelector(".portfolio-item-info");

    // Set lightbox content
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxTitle.textContent = title.textContent;
    lightboxDesc.textContent = category.textContent;

    // Set metadata
    if (info && lightboxMeta) {
      lightboxMeta.innerHTML = info.innerHTML;
    }

    // Show lightbox
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent scrolling
  }

  // Navigate lightbox function
  function navigateLightbox(direction) {
    if (direction === "prev") {
      currentIndex =
        (currentIndex - 1 + portfolioItems.length) % portfolioItems.length;
    } else {
      currentIndex = (currentIndex + 1) % portfolioItems.length;
    }

    const item = portfolioItems[currentIndex];

    // Get item details
    const img = item.querySelector("img");
    const title = item.querySelector(".portfolio-item-title");
    const category = item.querySelector(".portfolio-item-category");
    const info = item.querySelector(".portfolio-item-info");

    // Animate transition
    lightboxImg.style.opacity = "0";
    lightboxTitle.style.opacity = "0";
    lightboxDesc.style.opacity = "0";
    lightboxMeta.style.opacity = "0";

    setTimeout(() => {
      // Update lightbox content
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxTitle.textContent = title.textContent;
      lightboxDesc.textContent = category.textContent;

      // Set metadata
      if (info && lightboxMeta) {
        lightboxMeta.innerHTML = info.innerHTML;
      }

      // Fade in new content
      lightboxImg.style.opacity = "1";
      lightboxTitle.style.opacity = "1";
      lightboxDesc.style.opacity = "1";
      lightboxMeta.style.opacity = "1";
    }, 300);
  }
}

// Water splash effect setup
function setupWaterSplash() {
  const isIndexPage =
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname.endsWith("/");

  // Only apply water splash effect on index page
  if (!isIndexPage) return;

  document.addEventListener("click", function (e) {
    // Create splash element
    const splash = document.createElement("div");
    splash.className = "splash";

    // Position splash at click coordinates
    splash.style.left = e.pageX + "px";
    splash.style.top = e.pageY + "px";

    // Add to DOM
    document.body.appendChild(splash);

    // Remove after animation completes
    setTimeout(() => {
      splash.remove();
    }, 600);
  });
}

// Mouse tracking for glass cards
function setupMouseTracking() {
  const isIndexPage =
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname.endsWith("/");

  // Only apply mouse tracking on index page
  if (!isIndexPage) return;

  const glassCards = document.querySelectorAll(".glass-card");
  const maxRotation = 10; // Maximum rotation in degrees
  const maxTranslate = 4; // Maximum translation in pixels

  glassCards.forEach((card) => {
    card.addEventListener("mousemove", function (e) {
      // Don't apply effect if on mobile
      if (window.innerWidth <= 768) return;

      // Get position of cursor relative to card
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate rotation based on cursor position
      const xRotation = (y / rect.height - 0.5) * maxRotation;
      const yRotation = (x / rect.width - 0.5) * -maxRotation;

      // Calculate translation
      const xTranslate = (x / rect.width - 0.5) * maxTranslate;
      const yTranslate = (y / rect.height - 0.5) * maxTranslate;

      // Apply transformation
      this.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) translateX(${xTranslate}px) translateY(${yTranslate}px)`;
    });

    card.addEventListener("mouseleave", function () {
      // Reset transformation
      this.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
    });
  });
}

// Add animation styles dynamically
function addAnimationStyles() {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .will-animate {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.8s ease, transform 0.8s ease;
    }
    
    .animated {
      opacity: 1;
      transform: translateY(0);
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .fade-in {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.8s ease, transform 0.8s ease;
    }
    
    .fade-in.animated {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(styleSheet);
}

// Window resize handler
window.addEventListener("resize", function () {
  // Handle navigation responsiveness
  const mobileToggle = document.querySelector(".mobile-nav-toggle");
  const mobileMenu = document.querySelector(".mobile-nav-menu");

  if (window.innerWidth > 768) {
    mobileMenu.classList.remove("active");
    mobileToggle.classList.remove("active");
  }
});

// Page load performance optimization
window.addEventListener("load", function () {
  // Hide loading overlay with smoother transition
  const loadingOverlay = document.getElementById("loading-overlay");
  if (loadingOverlay) {
    setTimeout(() => {
      loadingOverlay.classList.add("hidden");
      setTimeout(() => {
        loadingOverlay.style.display = "none";
      }, 800);
    }, 800);
  }

  // Add animation class to sections for initial load
  document.querySelectorAll("section").forEach((section, index) => {
    setTimeout(() => {
      section.classList.add("loaded");
    }, 300 + index * 150);
  });
});

// Setup navigation
function setupNavigation() {
  const mobileToggle = document.querySelector(".mobile-nav-toggle");
  const mobileMenu = document.querySelector(".mobile-nav-menu");

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", function () {
      this.classList.toggle("active");
      mobileMenu.classList.toggle("active");
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", function (e) {
      if (
        !mobileToggle.contains(e.target) &&
        !mobileMenu.contains(e.target) &&
        mobileMenu.classList.contains("active")
      ) {
        mobileToggle.classList.remove("active");
        mobileMenu.classList.remove("active");
      }
    });
  }

  // Only setup glass navbar on index.html page
  const isIndexPage =
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname.endsWith("/");

  // Hide glass navbar and bubbles on non-index pages
  const glassNavbar = document.querySelector(".glass-navbar");
  const bubbles = document.querySelector(".bubbles");

  if (glassNavbar && !isIndexPage) {
    glassNavbar.style.display = "none";
  }

  if (bubbles && !isIndexPage) {
    bubbles.style.display = "none";
  }

  // Setup active state for glass navbar only on index page
  if (isIndexPage) {
    const glassCards = document.querySelectorAll(".glass-card");
    glassCards.forEach((card) => {
      const href = card.getAttribute("href");
      if (href === "#home") {
        card.classList.add("active");
      }
    });
  }
}

// Update active navigation on scroll
function updateActiveNavOnScroll() {
  window.addEventListener("scroll", function () {
    const scrollPosition = window.scrollY;
    const sections = document.querySelectorAll("section[id]");
    const isIndexPage =
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname.endsWith("/");

    // Only select glass-card elements if on index page
    const navLinks = isIndexPage
      ? document.querySelectorAll(".glass-card, .mobile-nav-menu a")
      : document.querySelectorAll(".mobile-nav-menu a");

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  });
}

// Wave text animation for hero title
function createWaveTextAnimation() {
  const heroTitle = document.querySelector(".hero-title .highlight");
  if (heroTitle) {
    const text = heroTitle.textContent;
    heroTitle.textContent = "";

    for (let i = 0; i < text.length; i++) {
      const span = document.createElement("span");
      span.textContent = text[i];
      span.style.animationDelay = `${i * 0.05}s`;
      span.classList.add("wave-letter");
      heroTitle.appendChild(span);
    }
  }
}

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Alert function
function showAlert(message, type) {
  // Create alert element
  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <i class="fas fa-${
      type === "success" ? "check-circle" : "exclamation-triangle"
    }"></i>
    <span>${message}</span>
    <button class="alert-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;

  // Add styles
  alert.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#2ecc71" : "#e74c3c"};
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 300px;
    animation: slideInRight 0.3s ease;
  `;

  // Add to page
  document.body.appendChild(alert);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alert.parentElement) {
      alert.remove();
    }
  }, 5000);
}
