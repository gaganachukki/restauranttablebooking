/**
 * STACKLY — RESTAURANT TABLE BOOKING PLATFORM
 * Common Dashboard Utilities (js/dashboard.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".dashboard-sidebar");
  const mobileToggle = document.querySelector(".dashboard-mobile-toggle");
  const sidebarClose = document.querySelector(".sidebar-close-btn");
  const headerDateElem = document.querySelector(".header-date-badge span");
  const userProfileName = document.querySelector(".user-info-text h4");
  const userProfileRole = document.querySelector(".user-info-text p");

  // 1. Mobile Sidebar Toggle
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener("click", () => {
      sidebar.classList.add("open");
    });
  }

  if (sidebarClose && sidebar) {
    sidebarClose.addEventListener("click", () => {
      sidebar.classList.remove("open");
    });
  }

  // Close sidebar on click outside on mobile
  document.addEventListener("click", (e) => {
    if (sidebar && sidebar.classList.contains("open")) {
      if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
        sidebar.classList.remove("open");
      }
    }
  });

  // 2. Set Current Header Date
  if (headerDateElem) {
    const now = new Date();
    const options = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
    headerDateElem.textContent = now.toLocaleDateString("en-US", options);
  }

  // 3. User Session Profile Name Sync
  const sessionUser = JSON.parse(sessionStorage.getItem("stackly_user") || "null");
  if (sessionUser) {
    if (userProfileName) userProfileName.textContent = sessionUser.name || (sessionUser.role === "admin" ? "STACKLY Admin" : "Client User");
    if (userProfileRole) userProfileRole.textContent = sessionUser.role === "admin" ? "Super Administrator" : "Dine Club Member";
  }

  // 4. Notification Refresh Spin Animation
  const refreshBtn = document.getElementById("refreshNotificationsBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      refreshBtn.style.transform = "rotate(360deg)";
      refreshBtn.style.transition = "transform 0.6s ease";
      if (typeof showToast === "function") showToast("Demonstration notifications refreshed.");
      setTimeout(() => {
        refreshBtn.style.transform = "none";
        refreshBtn.style.transition = "none";
      }, 600);
    });
  }

  // 5. Dashboard Sidebar Multi-View Switcher (SPA navigation with URL Hash)
  initDashboardViewSwitcher();

  // 6. Concierge Live Chat (Client Dashboard)
  initConciergeChat();

  // 7. Dining History & Receipts (Client Dashboard)
  initClientDiningHistory();

  // 8. Logout Handlers
  initLogoutHandlers();

  // 9. Universal Whitelist Interceptor
  initUniversal404Interceptor();
});

/**
 * Dashboard Multi-View Switcher
 * Switches between dedicated dashboard view pages and preserves state via URL hash.
 */
function initDashboardViewSwitcher() {
  const sidebarLinks = document.querySelectorAll(".sidebar-nav .sidebar-link[data-view]");
  const viewContainers = document.querySelectorAll(".dashboard-view");
  const pageTitle = document.querySelector(".dashboard-page-title");
  const pageSubtitle = document.querySelector(".dashboard-page-subtitle");

  if (!sidebarLinks.length || !viewContainers.length) return;

  function switchView(viewId, updateHash = true) {
    if (!viewId) viewId = "dashboard";

    let targetView = document.getElementById("view-" + viewId);
    if (!targetView) {
      viewId = "dashboard";
      targetView = document.getElementById("view-dashboard");
    }
    if (!targetView) return;

    // 1. Hide all views and show target view
    viewContainers.forEach(v => {
      v.style.display = "none";
      v.classList.remove("active");
    });
    targetView.style.display = "block";
    targetView.classList.add("active");

    // 2. Update active state on sidebar links and title
    sidebarLinks.forEach(link => {
      if (link.dataset.view === viewId) {
        link.classList.add("active");
        if (pageTitle && link.dataset.title) {
          pageTitle.textContent = link.dataset.title;
        }
        if (pageSubtitle && link.dataset.subtitle) {
          pageSubtitle.textContent = link.dataset.subtitle;
        }
      } else {
        link.classList.remove("active");
      }
    });

    // 3. Update hash
    if (updateHash) {
      history.replaceState(null, null, "#" + viewId);
    }

    // 4. Close mobile sidebar if open
    const sidebar = document.querySelector(".dashboard-sidebar");
    if (sidebar && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
    }

    // 5. Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Click handler
  sidebarLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchView(link.dataset.view, true);
    });
  });

  // Direct buttons that switch views (supports dynamic elements via delegation)
  document.addEventListener("click", (e) => {
    const jumpBtn = e.target.closest("[data-jump-view]");
    if (jumpBtn) {
      e.preventDefault();
      switchView(jumpBtn.dataset.jumpView, true);
    }
  });

  // Initial load from Hash
  const hash = window.location.hash.replace("#", "").trim();
  switchView(hash || "dashboard", false);

  window.addEventListener("hashchange", () => {
    const currentHash = window.location.hash.replace("#", "").trim();
    switchView(currentHash || "dashboard", false);
  });
}

function initConciergeChat() {
  const chatInput = document.getElementById("conciergeChatInput");
  const sendBtn = document.getElementById("conciergeSendBtn");
  const messagesArea = document.getElementById("conciergeChatMessages");
  const chips = document.querySelectorAll(".prompt-chip");

  if (!chatInput || !sendBtn || !messagesArea) return;

  function appendMessage(text, isUser = false) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${isUser ? 'user' : 'concierge'}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    bubble.innerHTML = `
      <p style="margin: 0;">${text}</p>
      <div class="chat-time">${timeStr}</div>
    `;
    messagesArea.appendChild(bubble);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function handleSend(userText) {
    const text = userText || chatInput.value.trim();
    if (!text) return;

    appendMessage(text, true);
    chatInput.value = "";

    // Simulated Smart Concierge Response
    setTimeout(() => {
      let reply = "Thank you for reaching out to the STACKLY VIP Concierge. Our head maître d' has noted your request and will ensure your table is impeccably prepared.";
      const lower = text.toLowerCase();

      if (lower.includes("wine") || lower.includes("sommelier") || lower.includes("pairing")) {
        reply = "Our head sommelier recommends pairing the Côte de Beaune Pinot Noir with this evening's roasted truffle squab. We have reserved a bottle in our cellar for your booking.";
      } else if (lower.includes("anniversary") || lower.includes("birthday") || lower.includes("celebration")) {
        reply = "A joyous milestone! We have flagged your reservation for complimentary house champagne and placed you at our most romantic candlelit corner booth.";
      } else if (lower.includes("dietary") || lower.includes("vegan") || lower.includes("vegetarian") || lower.includes("allergy")) {
        reply = "We have notified the executive chef. A bespoke multi-course plant-based tasting menu has been curated for your party with zero cross-contamination.";
      } else if (lower.includes("table") || lower.includes("corner") || lower.includes("window")) {
        reply = "Your preferred window table overlooking the courtyard fountain has been locked in and reserved for your evening.";
      }

      appendMessage(reply, false);
    }, 600);
  }

  sendBtn.addEventListener("click", () => handleSend());
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  });

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      handleSend(chip.textContent.trim());
    });
  });
}

function initClientDiningHistory() {
  document.querySelectorAll(".download-receipt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const resto = btn.dataset.resto || "Dining Experience";
      if (typeof showToast === "function") {
        showToast(`Tax invoice and itemized receipt for ${resto} downloaded.`);
      } else {
        alert(`Demonstration PDF Receipt downloaded for ${resto}.`);
      }
    });
  });

  document.querySelectorAll(".leave-review-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const resto = btn.dataset.resto || "the restaurant";
      const rating = prompt(`Leave a star rating for ${resto} (1-5 stars):`, "5");
      if (rating) {
        if (typeof showToast === "function") {
          showToast(`Thank you! Your ${rating}★ review for ${resto} has been published.`);
        } else {
          alert(`Thank you! Your ${rating}★ review for ${resto} has been recorded.`);
        }
      }
    });
  });
}

function initLogoutHandlers() {
  const logoutButtons = document.querySelectorAll(".sidebar-logout-btn, #clientLogoutBtn, #adminLogoutBtn");
  logoutButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to log out of STACKLY?")) {
        sessionStorage.removeItem("stackly_user");
        window.location.href = "login.html";
      }
    });
  });
}

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
      // Allow dashboard sidebar navigation options, action buttons, modals, and tabs to work
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
