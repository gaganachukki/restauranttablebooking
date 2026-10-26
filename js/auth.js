/**
 * STACKLY — RESTAURANT TABLE BOOKING PLATFORM
 * Authentication & Session Management (js/auth.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const rolePills = document.querySelectorAll(".role-pill");
  const roleHiddenInput = document.getElementById("authRoleInput");
  const logoutBtns = document.querySelectorAll(".sidebar-logout-btn, .logout-action-btn");

  // 1. Role Selector Pill Toggle
  if (rolePills.length > 0) {
    rolePills.forEach(pill => {
      pill.addEventListener("click", () => {
        rolePills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        const role = pill.dataset.role;
        if (roleHiddenInput) roleHiddenInput.value = role;
      });
    });
  }

  // 2. Demo Quick-Fill Buttons
  const fillAdminBtn = document.getElementById("quickFillAdmin");
  const fillClientBtn = document.getElementById("quickFillClient");

  if (fillAdminBtn) {
    fillAdminBtn.addEventListener("click", () => {
      const emailInput = document.getElementById("loginEmail");
      const passInput = document.getElementById("loginPassword");
      if (emailInput) emailInput.value = "admin@stackly.com";
      if (passInput) passInput.value = "admin123";
      
      // Select Admin pill
      rolePills.forEach(p => {
        p.classList.toggle("active", p.dataset.role === "admin");
      });
      if (roleHiddenInput) roleHiddenInput.value = "admin";
      if (typeof showToast === "function") showToast("Filled demonstration Admin credentials.");
    });
  }

  if (fillClientBtn) {
    fillClientBtn.addEventListener("click", () => {
      const emailInput = document.getElementById("loginEmail");
      const passInput = document.getElementById("loginPassword");
      if (emailInput) emailInput.value = "client@stackly.com";
      if (passInput) passInput.value = "client123";

      // Select Client pill
      rolePills.forEach(p => {
        p.classList.toggle("active", p.dataset.role === "client");
      });
      if (roleHiddenInput) roleHiddenInput.value = "client";
      if (typeof showToast === "function") showToast("Filled demonstration Client credentials.");
    });
  }

  // 3. Login Submission
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const emailInput = document.getElementById("loginEmail");
      const passInput = document.getElementById("loginPassword");
      const role = roleHiddenInput ? roleHiddenInput.value : "client";

      if (typeof Validation === "undefined") return;

      const isEmailValid = Validation.validateEmail(emailInput);
      const isPassValid = Validation.validatePasswordLength(passInput, 6);

      if (!isEmailValid || !isPassValid) {
        if (typeof showToast === "function") showToast("Please check your email and password.", true);
        return;
      }

      // Set demonstration session
      const demoUser = {
        email: emailInput.value.trim(),
        role: role,
        name: role === "admin" ? "STACKLY Admin" : "Arun Kumar",
        loginTime: new Date().toISOString()
      };

      sessionStorage.setItem("stackly_user", JSON.stringify(demoUser));

      if (typeof showToast === "function") {
        showToast(`Welcome! Signing in as ${role === 'admin' ? 'Administrator' : 'Client'}...`);
      }

      setTimeout(() => {
        if (role === "admin") {
          window.location.href = "AdminDashboard.html";
        } else {
          window.location.href = "ClientDashboard.html";
        }
      }, 700);
    });
  }

  // 4. Signup Submission
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("signupName");
      const emailInput = document.getElementById("signupEmail");
      const phoneInput = document.getElementById("signupPhone");
      const passInput = document.getElementById("signupPassword");
      const confirmPassInput = document.getElementById("signupConfirmPassword");
      const termsInput = document.getElementById("signupTerms");
      const role = roleHiddenInput ? roleHiddenInput.value : "client";

      if (typeof Validation === "undefined") return;

      const isNameValid = Validation.validateRequired(nameInput, "Full name");
      const isEmailValid = Validation.validateEmail(emailInput);
      const isPhoneValid = Validation.validatePhone(phoneInput);
      const isPassValid = Validation.validatePasswordLength(passInput, 6);
      const isMatchValid = Validation.validateMatch(passInput, confirmPassInput);
      const isTermsValid = Validation.validateCheckbox(termsInput, "You must accept Terms & Conditions");

      if (!isNameValid || !isEmailValid || !isPhoneValid || !isPassValid || !isMatchValid || !isTermsValid) {
        if (typeof showToast === "function") showToast("Please correct the errors in the form.", true);
        return;
      }

      // Save demonstration account into localStorage
      const users = JSON.parse(localStorage.getItem("stackly_accounts") || "[]");
      const newAccount = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        role: role,
        registeredAt: new Date().toISOString()
      };
      users.push(newAccount);
      localStorage.setItem("stackly_accounts", JSON.stringify(users));

      if (typeof showToast === "function") {
        showToast("Demo account created successfully! Redirecting to login...");
      }

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    });
  }

  // 5. Logout Action
  logoutBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.removeItem("stackly_user");
      if (typeof showToast === "function") showToast("Signed out successfully.");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 400);
    });
  });

  // 6. Universal Whitelist Interceptor
  initUniversal404Interceptor();
});

/**
 * Universal 404 Click Interceptor
 * Strictly enforces that ONLY circled elements function normally.
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

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.href = "404.html";
      return;
    }

    // 2. SIGNUP PAGE WHITELIST
    if (currentPath === "signup.html") {
      if (clickable.classList.contains("role-pill") || clickable.closest(".role-pill")) {
        return;
      }
      if (clickable.type === "submit" && clickable.closest("#signupForm")) {
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
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.href = "404.html";
      return;
    }

    // 4. STANDARD SITE PAGES (index.html, about.html, services.html, blog.html, contact.html)
    // Footer links & footer logo are NOT whitelisted
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

    if (isNavLogo || isNavLink || isNavLoginBtn || isNavSearchBtn || isHamburger || isMobileNavLink || isModalCloseBtn || isFaqToggle || isRestoFilter || isFormSubmit || isFormActionBtn) {
      return; // Allowed navbar, FAQ accordion, filter, or form submission element
    }

    // All other buttons, links, cards, filters, and submit buttons redirect to 404.html
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    window.location.href = "404.html";
  }, true);
}
