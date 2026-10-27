/**
 * STACKLY — RESTAURANT TABLE BOOKING PLATFORM
 * Navigation, Search Modal & Mobile Drawer Handler (js/navigation.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const mobileNav = document.querySelector(".mobile-nav");
  const mobileBackdrop = document.querySelector(".mobile-nav-backdrop");
  const searchBtn = document.querySelector(".nav-search-btn");

  // 1. Sticky Header Background Transition on Scroll
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  // 2. Active Nav Link Detection
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link, .mobile-nav-link").forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // 3. Hamburger Mobile Menu Toggle
  const toggleMobileMenu = (open) => {
    if (!mobileNav) return;
    const shouldOpen = open !== undefined ? open : !mobileNav.classList.contains("open");
    if (shouldOpen) {
      mobileNav.classList.add("open");
      if (hamburgerBtn) hamburgerBtn.classList.add("active");
      if (mobileBackdrop) mobileBackdrop.classList.add("show");
      document.body.style.overflow = "hidden";
      
      // Animate mobile links with GSAP if available
      if (window.gsap) {
        gsap.fromTo(".mobile-nav-link", 
          { x: 20, opacity: 0 }, 
          { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out", clearProps: "all" }
        );
      }
    } else {
      mobileNav.classList.remove("open");
      if (hamburgerBtn) hamburgerBtn.classList.remove("active");
      if (mobileBackdrop) mobileBackdrop.classList.remove("show");
      document.body.style.overflow = "";
    }
  };

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener("click", () => toggleMobileMenu(false));
  }

  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", () => toggleMobileMenu(false));
  });

  // Delegated close listener for mobile drawer close buttons
  document.addEventListener("click", (e) => {
    if (e.target.closest(".mobile-nav-close")) {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileMenu(false);
    }
  });

  // ESC key dismiss for mobile drawer
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileNav && mobileNav.classList.contains("open")) {
      toggleMobileMenu(false);
    }
  });

  // 4. Interactive Live Search Modal
  const createSearchModal = () => {
    let modal = document.getElementById("searchModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "searchModal";
    modal.className = "modal-backdrop";
    modal.innerHTML = `
      <div class="modal-window">
        <button class="modal-close-btn" aria-label="Close search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 1.35rem; margin-bottom: 8px;">Discover Restaurants</h3>
          <p style="font-size: 0.875rem; color: var(--color-muted);">Search by restaurant name, cuisine, city, or neighborhood.</p>
        </div>
        <div style="position: relative; margin-bottom: 24px;">
          <input type="text" id="globalSearchInput" class="form-control" placeholder="e.g. Olive Table, South Indian, Bengaluru, Italian..." autofocus style="padding-left: 44px; font-size: 1rem; border-radius: 9999px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--color-green);">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <div id="searchResultsList" style="display: flex; flex-direction: column; gap: 12px; max-height: 380px; overflow-y: auto;">
          <p style="font-size: 0.8125rem; color: var(--color-muted); text-align: center; padding: 24px 0;">Type above to search demonstration listings...</p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector(".modal-close-btn");
    closeBtn.addEventListener("click", () => modal.classList.remove("show"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });

    const searchInput = modal.querySelector("#globalSearchInput");
    const resultsContainer = modal.querySelector("#searchResultsList");

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        resultsContainer.innerHTML = `<p style="font-size: 0.8125rem; color: var(--color-muted); text-align: center; padding: 24px 0;">Type above to search demonstration listings...</p>`;
        return;
      }

      if (typeof StacklyData !== "undefined") {
        const restaurants = StacklyData.getRestaurants();
        const matches = restaurants.filter(r => 
          r.name.toLowerCase().includes(query) ||
          r.cuisine.toLowerCase().includes(query) ||
          r.city.toLowerCase().includes(query) ||
          r.location.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
          resultsContainer.innerHTML = `<p style="font-size: 0.875rem; color: var(--color-muted); text-align: center; padding: 32px 0;">No restaurants found matching "<strong>${e.target.value}</strong>". Try Italian, Indian, or Chennai.</p>`;
        } else {
          resultsContainer.innerHTML = matches.map(r => `
            <div style="display: flex; align-items: center; gap: 14px; padding: 10px; border-radius: 12px; border: 1px solid var(--color-border); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.backgroundColor='#F2F7F4'" onmouseout="this.style.backgroundColor='transparent'" onclick="window.location.href='404.html'">
              <img src="${r.image}" alt="${r.name}" style="width: 54px; height: 54px; border-radius: 8px; object-fit: cover;">
              <div style="flex: 1;">
                <h4 style="font-size: 0.9375rem; font-weight: 600; margin-bottom: 2px;">${r.name}</h4>
                <p style="font-size: 0.75rem; color: var(--color-muted);">${r.cuisine} • ${r.location}</p>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.75rem; font-weight: 600; color: var(--color-gold);">★ ${r.rating}</span>
                <p style="font-size: 0.75rem; color: var(--color-green); font-weight: 600;">${r.priceTag}</p>
              </div>
            </div>
          `).join("");
        }
      }
    });

    return modal;
  };

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const modal = createSearchModal();
      modal.classList.add("show");
      setTimeout(() => {
        const input = document.getElementById("globalSearchInput");
        if (input) input.focus();
      }, 100);
    });
  }

  // Keyboard escape handler
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      toggleMobileMenu(false);
      const searchModal = document.getElementById("searchModal");
      if (searchModal) searchModal.classList.remove("show");
      document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.remove("show"));
    }
  });

  // 5. Universal Whitelist Interceptor: Only circled navbar/header elements function; ALL OTHER buttons and links redirect to 404.html
  initUniversal404Interceptor();
});

/**
 * Universal 404 Click Interceptor
 * Strictly enforces that ONLY circled elements function normally:
 * 1. login.html: "Back to Home", Role pills, "Sign In to STACKLY →" submit
 * 2. Standard site pages (index, about, services, blog, contact):
 *    Top navbar logo, navbar links (Home, About, Services, Blog, Contact),
 *    Search button, Login button, Mobile hamburger button, Mobile links, Search close button.
 * 3. signup.html: Role pills, "Create Demonstration Account →" submit
 * 4. 404.html: "Back to Home →", "Go Back" history button
 * ALL other buttons and links across the entire project redirect to 404.html.
 */
function initUniversal404Interceptor() {
  if (window.__stackly404InterceptorAttached) return;
  window.__stackly404InterceptorAttached = true;

  document.addEventListener("click", (e) => {
    const rawPath = window.location.pathname.split("/").pop() || "index.html";
    const currentPath = rawPath.toLowerCase();

    // 404.html itself has its own back navigation - do not intercept
    if (currentPath === "404.html") return;

    // Find any clicked interactive element
    const target = e.target;
    const clickable = target.closest(
      "a, button, summary, [role='button'], .category-item, .time-pill, .city-tab-btn, .card-book-btn, .card-arrow-btn, .booking-bar-btn, .header-action-btn, .copy-addr-btn"
    );

    if (!clickable) return;

    // Never intercept clicks on dashboard pages
    if (currentPath.includes("dashboard")) {
      return;
    }

    // 0. UNIVERSAL STACKLY LOGO: Must always lead directly to home page (index.html)
    const isStacklyLogo = clickable.classList.contains("nav-logo") ||
                          clickable.closest(".nav-logo") ||
                          clickable.classList.contains("footer-logo-link") ||
                          clickable.closest(".footer-logo-link") ||
                          clickable.classList.contains("sidebar-brand") ||
                          clickable.closest(".sidebar-brand") ||
                          clickable.classList.contains("auth-brand-logo") ||
                          clickable.closest(".auth-brand-logo") ||
                          clickable.closest(".auth-visual-header") ||
                          clickable.querySelector("img[src*='logo']") ||
                          (clickable.tagName === "IMG" && clickable.src.includes("logo")) ||
                          (clickable.tagName === "A" && clickable.querySelector("img[alt*='STACKLY']"));

    if (isStacklyLogo) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.href = "index.html";
      return;
    }

    // 1. LOGIN PAGE WHITELIST
    if (currentPath === "login.html") {
      if (
        clickable.classList.contains("back-home-link") ||
        clickable.closest(".back-home-link") ||
        (clickable.tagName === "A" && clickable.textContent.includes("Back to Home"))
      ) {
        return;
      }
      if (clickable.classList.contains("role-pill") || clickable.closest(".role-pill")) {
        return;
      }
      if (clickable.type === "submit" && clickable.closest("#loginForm")) {
        return;
      }
      // Allow Create an Account link to navigate directly to signup.html
      const isCreateAccount = (clickable.tagName === "A" && clickable.getAttribute("href") === "signup.html") ||
                              clickable.closest("a[href*='signup']") ||
                              clickable.id === "goToSignupLink" ||
                              clickable.classList.contains("auth-switch-link") ||
                              (clickable.tagName === "A" && clickable.textContent.includes("Create an Account"));
      if (isCreateAccount) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = "signup.html";
        return;
      }
      // Quick fill demo buttons
      if (clickable.id === "quickFillClient" || clickable.id === "quickFillAdmin" || clickable.closest(".demo-quick-btn")) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.href = "404.html";
      return;
    }

    // 2. SIGNUP PAGE WHITELIST
    if (currentPath === "signup.html") {
      if (
        clickable.classList.contains("back-home-link") ||
        clickable.closest(".back-home-link") ||
        (clickable.tagName === "A" && clickable.textContent.includes("Back to Home"))
      ) {
        return;
      }
      if (clickable.classList.contains("role-pill") || clickable.closest(".role-pill")) {
        return;
      }
      if (clickable.type === "submit" && clickable.closest("#signupForm")) {
        return;
      }
      // Allow Sign In link to navigate directly to login.html
      const isSignIn = (clickable.tagName === "A" && clickable.getAttribute("href") === "login.html") ||
                       clickable.closest("a[href*='login']") ||
                       clickable.id === "goToLoginLink" ||
                       clickable.classList.contains("auth-switch-link") ||
                       (clickable.tagName === "A" && clickable.textContent.includes("Sign In"));
      if (isSignIn) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = "login.html";
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.href = "404.html";
      return;
    }

    // 3. DASHBOARD PAGES (ClientDashboard.html, AdminDashboard.html)
    if (currentPath === "clientdashboard.html" || currentPath === "admindashboard.html") {
      // Allow dashboard sidebar navigation options, action buttons, modals, and tabs to work
      return;
    }

    // 4. STANDARD SITE PAGES (index.html, about.html, services.html, blog.html, contact.html)
    // Scroll-to-top button should smoothly scroll to top
    const isScrollTop = clickable.classList.contains("footer-scroll-top") || clickable.closest(".footer-scroll-top") || clickable.id === "footerScrollTop";
    if (isScrollTop) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Allow footer navigation links pointing to valid site pages (Home, About, Restaurants, Services, Blog, Contact)
    const footerLink = clickable.classList.contains("footer-nav-link") ? clickable : clickable.closest(".footer-nav-link, .footer-links-list a");
    if (footerLink) {
      const href = footerLink.getAttribute("href");
      if (href && href !== "404.html" && href !== "#") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = href;
        return;
      }
    }

    // Other footer elements (social icons, privacy/terms 404 links, newsletter) redirect to 404
    const isInsideFooter = clickable.closest("footer, .site-footer");
    if (isInsideFooter) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.href = "404.html";
      return;
    }

    const isNavLogo = clickable.classList.contains("nav-logo") || clickable.closest(".nav-logo");
    const isNavLink = clickable.classList.contains("nav-link");
    const isNavLoginBtn = clickable.classList.contains("nav-login-btn") || clickable.closest(".nav-login-btn");
    const isNavSearchBtn = clickable.classList.contains("nav-search-btn") || clickable.closest(".nav-search-btn");
    const isHamburger = clickable.classList.contains("hamburger-btn") || clickable.closest(".hamburger-btn");
    const isMobileNavLink = clickable.classList.contains("mobile-nav-link");
    const isModalCloseBtn = clickable.classList.contains("modal-close-btn") || clickable.closest(".modal-close-btn");
    const isFaqToggle = clickable.classList.contains("faq-question") || clickable.closest(".faq-question") || clickable.closest(".faq-item");
    const isRestoFilter = clickable.classList.contains("resto-filter-btn") || clickable.closest(".resto-filter-btn") || clickable.classList.contains("resto-search-btn");
    const isFormSubmit = clickable.type === "submit" && (clickable.closest("#tableBookingForm") || clickable.closest("#contactForm"));
    const isFormActionBtn = clickable.id === "resetFormBtn" || clickable.closest("#resetFormBtn") || clickable.classList.contains("modal-done-btn") || clickable.closest(".modal-done-btn");

    const isInsideMobileNav = clickable.closest(".mobile-nav") || clickable.classList.contains("mobile-nav-close") || clickable.closest(".mobile-nav-close");

    if (isNavLogo || isNavLink || isNavLoginBtn || isNavSearchBtn || isHamburger || isMobileNavLink || isInsideMobileNav || isModalCloseBtn || isFaqToggle || isRestoFilter || isFormSubmit || isFormActionBtn) {
      return; // Allowed navbar, FAQ accordion, filter, or form submission element
    }

    // All other buttons, links, cards, filters, and submit buttons redirect to 404.html
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    window.location.href = "404.html";
  }, true);
}
