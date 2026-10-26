/**
 * STACKLY — RESTAURANT TABLE BOOKING PLATFORM
 * GSAP Animations, ScrollTrigger & Page Interactions (js/main.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Preloader Animation
  const preloader = document.getElementById("preloader");
  window.addEventListener("load", () => {
    if (preloader) {
      setTimeout(() => {
        preloader.classList.add("fade-out");
      }, 400);
    }
    // Refresh ScrollTrigger after all page images and layouts are fully loaded
    if (window.ScrollTrigger) {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    }
  });

  // Fallback in case load already fired
  if (document.readyState === "complete" && preloader) {
    setTimeout(() => {
      preloader.classList.add("fade-out");
    }, 400);
  }

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 2. GSAP Animations (if GSAP is loaded)
  if (window.gsap && !prefersReducedMotion) {
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Hero Section Entrance
    const heroTimeline = gsap.timeline({ delay: 0.3 });

    heroTimeline
      .from(".hero-badge", { y: -20, opacity: 0, duration: 0.6, ease: "power3.out" })
      .from(".hero-headline", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.4")
      .from(".hero-description", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
      .from(".hero-booking-bar", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.3")
      .from(".hero-cta-group", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
      .from(".floating-restaurant-card", { scale: 0.9, y: 40, opacity: 0, duration: 0.9, ease: "back.out(1.4)" }, "-=0.6")
      .from(".hero-handwritten-note", { rotate: -15, scale: 0.8, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.4");

    // ScrollTrigger for Sections (using fromTo with once:true and clearProps to eliminate frozen tweens)
    if (window.ScrollTrigger) {
      // Trust Strip
      gsap.fromTo(".trust-item", 
        { y: 24, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".trust-strip",
            start: "top 88%",
            once: true
          },
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "opacity,transform"
        }
      );

      // About Section Content & Visual
      gsap.fromTo(".about-content", 
        { x: -30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".about-section",
            start: "top 80%",
            once: true
          },
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          clearProps: "opacity,transform"
        }
      );

      gsap.fromTo(".about-visual", 
        { x: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".about-section",
            start: "top 80%",
            once: true
          },
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          clearProps: "opacity,transform"
        }
      );

      // How it Works Step Cards
      gsap.fromTo(".process-step-card", 
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".how-it-works-section",
            start: "top 85%",
            once: true
          },
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "opacity,transform"
        }
      );

      // Cuisine Gallery Tiles
      gsap.fromTo(".cuisine-tile", 
        { scale: 0.95, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".cuisine-gallery-section",
            start: "top 80%",
            once: true
          },
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
          clearProps: "opacity,transform"
        }
      );

      // Special Occasion Cards
      gsap.fromTo(".occasion-card", 
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".occasions-section",
            start: "top 85%",
            once: true
          },
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "opacity,transform"
        }
      );

      // Why Choose Us
      gsap.fromTo(".why-card", 
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".why-choose-section",
            start: "top 85%",
            once: true
          },
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "opacity,transform"
        }
      );

      // Upcoming Experiences
      gsap.fromTo(".experience-card", 
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".experiences-section",
            start: "top 85%",
            once: true
          },
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "opacity,transform"
        }
      );

      // Testimonials
      gsap.fromTo(".testimonial-card", 
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".testimonials-section",
            start: "top 85%",
            once: true
          },
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "opacity,transform"
        }
      );
    }
  }

  // Failsafe: Ensure no card stays stuck or transparent when in view
  if ('IntersectionObserver' in window) {
    const cardFailsafeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            if (entry.target && entry.target.style.opacity && parseFloat(entry.target.style.opacity) < 1) {
              entry.target.style.opacity = "1";
              entry.target.style.transform = "none";
            }
          }, 700);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".occasion-card, .why-card, .experience-card, .testimonial-card, .process-step-card").forEach(el => {
      cardFailsafeObserver.observe(el);
    });
  }

  // 3. Counter Animation for About Section
  const statNumbers = document.querySelectorAll(".stat-number[data-count]");
  if (statNumbers.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const targetCount = parseFloat(target.dataset.count);
          const suffix = target.dataset.suffix || "";
          let current = 0;
          const duration = 1500;
          const startTime = performance.now();

          const updateCount = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            if (targetCount % 1 !== 0) {
              current = (progress * targetCount).toFixed(1);
            } else {
              current = Math.floor(progress * targetCount);
            }
            target.textContent = current + suffix;
            if (progress < 1) {
              requestAnimationFrame(updateCount);
            }
          };
          requestAnimationFrame(updateCount);
          obs.unobserve(target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(elem => observer.observe(elem));
  }

  // 4. Interactive FAQ Accordion
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const questionBtn = item.querySelector(".faq-question");
    if (questionBtn) {
      questionBtn.addEventListener("click", () => {
        const isActive = item.classList.contains("active");
        
        // Close other items
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove("active");
            const otherBtn = other.querySelector(".faq-question");
            if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
          }
        });

        // Toggle current item
        const willBeActive = !isActive;
        item.classList.toggle("active", willBeActive);
        questionBtn.setAttribute("aria-expanded", willBeActive ? "true" : "false");
      });
    }
  });

  // 5. City Tabs in Location Discovery Section
  const cityTabs = document.querySelectorAll(".city-tab-btn");
  const cityRestList = document.getElementById("cityRestaurantsList");
  const selectedAddressCard = document.getElementById("selectedAddressCard");

  if (cityTabs.length > 0 && typeof StacklyData !== "undefined") {
    cityTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        cityTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const city = tab.dataset.city;

        // Filter restaurants for city
        const matching = StacklyData.getRestaurants().filter(r => r.city.toLowerCase() === city.toLowerCase());
        
        if (cityRestList) {
          if (matching.length === 0) {
            cityRestList.innerHTML = `<p style="padding: 20px; color: var(--color-muted);">No locations listed for ${city} currently.</p>`;
          } else {
            cityRestList.innerHTML = matching.map((r, i) => `
              <div class="city-restaurant-item ${i === 0 ? 'active' : ''}" data-address="${r.address}" data-name="${r.name}">
                <img src="${r.image}" alt="${r.name}" class="city-rest-thumb">
                <div class="city-rest-info">
                  <h4>${r.name}</h4>
                  <p>${r.cuisine} • ${r.location}</p>
                </div>
              </div>
            `).join("");

            // Reattach click
            document.querySelectorAll(".city-restaurant-item").forEach(item => {
              item.addEventListener("click", () => {
                document.querySelectorAll(".city-restaurant-item").forEach(ci => ci.classList.remove("active"));
                item.classList.add("active");
                if (selectedAddressCard) {
                  selectedAddressCard.querySelector(".sel-name").textContent = item.dataset.name;
                  selectedAddressCard.querySelector(".sel-address").textContent = item.dataset.address;
                }
              });
            });

            // Update first item in address card
            if (matching[0] && selectedAddressCard) {
              selectedAddressCard.querySelector(".sel-name").textContent = matching[0].name;
              selectedAddressCard.querySelector(".sel-address").textContent = matching[0].address;
            }
          }
        }
      });
    });
  }

  // Directions External Link Handler
  const directionsBtn = document.getElementById("getDirectionsBtn");
  if (directionsBtn && selectedAddressCard) {
    directionsBtn.addEventListener("click", () => {
      const address = selectedAddressCard.querySelector(".sel-address").textContent;
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      window.open(url, "_blank");
    });
  }

  // 6. Global Newsletter Form Handling
  const newsletterForms = document.querySelectorAll(".newsletter-form, .footer-newsletter-box");
  newsletterForms.forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector(".newsletter-input, .footer-email-field");
      if (input && input.value.trim()) {
        if (typeof showToast === "function") {
          showToast("Thank you for subscribing to STACKLY updates!");
        }
        input.value = "";
      }
    });
  });

  // 7. Scroll-to-Top Button
  const scrollTopBtn = document.getElementById("footerScrollTop");
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
