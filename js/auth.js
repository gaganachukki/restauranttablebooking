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

      // Derive user details (name, email, avatar initial) from ID entered while logging in
      const userDetails = deriveUserFromLoginId(emailInput.value, role);
      const sessionUser = {
        email: userDetails.email,
        role: role,
        name: userDetails.name,
        avatarInitial: userDetails.avatarInitial,
        loginTime: new Date().toISOString()
      };

      sessionStorage.setItem("stackly_user", JSON.stringify(sessionUser));
      localStorage.setItem("stackly_user", JSON.stringify(sessionUser));

      if (typeof showToast === "function") {
        showToast(`Welcome, ${userDetails.name}! Signing in as ${role === 'admin' ? 'Administrator' : 'Client'}...`);
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
      try {
        sessionStorage.removeItem("stackly_user");
        localStorage.removeItem("stackly_user");
      } catch (err) {}
      window.location.href = "login.html";
    });
  });

  // 6. Universal Whitelist Interceptor
  initUniversal404Interceptor();
});

/**
 * Derives user display name, email, and avatar initial from the login identifier.
 * Ensures the name and email displayed across the dashboard reflect the user ID entered while logging in.
 */
function deriveUserFromLoginId(rawId, role) {
  const trimmed = (rawId || "").trim();
  if (!trimmed) {
    return {
      email: role === "admin" ? "admin@stackly.com" : "client@stackly.com",
      name: role === "admin" ? "STACKLY Admin" : "Arun Kumar",
      avatarInitial: role === "admin" ? "S" : "A"
    };
  }

  // 1. Check if user exists in registered stackly_accounts
  try {
    const savedAccounts = JSON.parse(localStorage.getItem("stackly_accounts") || "[]");
    const matched = savedAccounts.find(a => 
      (a.email && a.email.toLowerCase() === trimmed.toLowerCase()) ||
      (a.name && a.name.toLowerCase() === trimmed.toLowerCase())
    );
    if (matched && matched.name) {
      return {
        email: matched.email || trimmed,
        name: matched.name,
        avatarInitial: matched.name.charAt(0).toUpperCase()
      };
    }
  } catch (e) {}

  // 2. Check preset demo credentials
  if (trimmed.toLowerCase() === "admin@stackly.com") {
    return {
      email: "admin@stackly.com",
      name: "STACKLY Admin",
      avatarInitial: "S"
    };
  }
  if (trimmed.toLowerCase() === "client@stackly.com") {
    return {
      email: "client@stackly.com",
      name: "Arun Kumar",
      avatarInitial: "A"
    };
  }

  // 3. Extract username and email from the entered ID
  let email = trimmed;
  let rawUsername = trimmed;

  if (trimmed.includes("@")) {
    rawUsername = trimmed.split("@")[0];
    email = trimmed;
  } else {
    // If entered as bare ID/username without domain
    email = `${trimmed.toLowerCase()}@gmail.com`;
  }

  // Clean and format rawUsername into a human-readable Title Case Name
  // Handles dots, underscores, hyphens, pluses, and camelCase
  const cleaned = rawUsername
    .replace(/[._\-+]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  let formattedName = "";
  if (words.length > 0) {
    formattedName = words
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  if (!formattedName) {
    formattedName = role === "admin" ? "STACKLY Admin" : "Client User";
  }

  const avatarInitial = formattedName.charAt(0).toUpperCase() || "U";

  return {
    email: email,
    name: formattedName,
    avatarInitial: avatarInitial
  };
}
window.deriveUserFromLoginId = deriveUserFromLoginId;

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

    // auth.js ONLY enforces whitelist on login.html and signup.html
    if (currentPath !== "login.html" && currentPath !== "signup.html") {
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
