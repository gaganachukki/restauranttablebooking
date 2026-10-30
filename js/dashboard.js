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

  const backdrop = document.querySelector(".dashboard-backdrop");

  const openSidebar = () => {
    if (sidebar) sidebar.classList.add("open");
    if (backdrop) backdrop.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  const closeSidebar = () => {
    if (sidebar) sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("show");
    document.body.style.overflow = "";
  };

  // 1. Mobile Sidebar Toggle
  if (mobileToggle) {
    mobileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      openSidebar();
    });
  }

  if (sidebarClose) {
    sidebarClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeSidebar();
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", () => {
      closeSidebar();
    });
  }

  // Close sidebar on click outside on mobile
  document.addEventListener("click", (e) => {
    if (sidebar && sidebar.classList.contains("open")) {
      if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeSidebar();
      }
    }
  });

  // ESC key dismiss for mobile sidebar
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar && sidebar.classList.contains("open")) {
      closeSidebar();
    }
  });

  // 2. Set Current Header Date
  if (headerDateElem) {
    const now = new Date();
    const options = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
    headerDateElem.textContent = now.toLocaleDateString("en-US", options);
  }

  // 3. User Session Profile & Sidebar Sync (Admin & Client)
  syncUserSessionProfile();

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

  // Click handler on links
  sidebarLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      switchView(link.dataset.view, true);
    });
  });

  // Delegated click handler for sidebar links and jump-view buttons (supports all dynamic elements)
  document.addEventListener("click", (e) => {
    const link = e.target.closest(".sidebar-nav .sidebar-link[data-view]");
    if (link) {
      e.preventDefault();
      e.stopPropagation();
      switchView(link.dataset.view, true);
      return;
    }

    const jumpBtn = e.target.closest("[data-jump-view]");
    if (jumpBtn) {
      e.preventDefault();
      e.stopPropagation();
      switchView(jumpBtn.dataset.jumpView, true);
      return;
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
  document.querySelectorAll(".download-receipt-btn, .leave-review-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      window.location.href = "404.html";
    });
  });
}

function initLogoutHandlers() {
  document.addEventListener("click", (e) => {
    const logoutBtn = e.target.closest(".sidebar-logout-btn, #clientLogoutBtn, #adminLogoutBtn");
    if (logoutBtn) {
      e.preventDefault();
      e.stopPropagation();
      try {
        sessionStorage.removeItem("stackly_user");
        localStorage.removeItem("stackly_user");
      } catch (err) {}
      window.location.href = "login.html";
    }
  }, true);
}

// Dashboard global navigation safeguard: Ensures no dashboard navigation ever redirects to 404
document.addEventListener("click", (e) => {
  const brandLogo = e.target.closest(".sidebar-brand, .nav-logo, .footer-logo-link");
  if (brandLogo) {
    e.preventDefault();
    window.location.href = "index.html";
    return;
  }
});

/**
 * User Session Profile & Sidebar Synchronizer
 * Synchronizes the logged-in user's name, email, avatar initial, and role
 * across the sidebar user card, header profile, and settings forms for both Admin and Client portals.
 */
function syncUserSessionProfile() {
  let sessionUser = null;
  try {
    sessionUser = JSON.parse(sessionStorage.getItem("stackly_user") || localStorage.getItem("stackly_user") || "null");
  } catch (e) {}

  const isCurrentAdminPage = window.location.pathname.toLowerCase().includes("admindashboard") || 
                             Boolean(document.querySelector(".sidebar-user-card .user-panel-badge")?.textContent.includes("ADMIN"));

  // If no session exists in storage, provide clean defaults (never hardcoded 'Gaganachukki')
  if (!sessionUser) {
    sessionUser = {
      name: isCurrentAdminPage ? "STACKLY Admin" : "Arun Kumar",
      email: isCurrentAdminPage ? "admin@stackly.com" : "client@stackly.com",
      role: isCurrentAdminPage ? "admin" : "client",
      avatarInitial: isCurrentAdminPage ? "S" : "A"
    };
  }

  const userName = sessionUser.name || (sessionUser.role === "admin" ? "STACKLY Admin" : "Client User");
  const userEmail = sessionUser.email || (sessionUser.role === "admin" ? "admin@stackly.com" : "client@stackly.com");
  const userRole = sessionUser.role === "admin" ? "Super Administrator" : "Dine Club Member";
  const avatarChar = sessionUser.avatarInitial || (userName ? userName.charAt(0).toUpperCase() : "U");

  // 1. Update Sidebar User Card (.sidebar-user-card .user-name & .user-email)
  document.querySelectorAll(".sidebar-user-card .user-name").forEach(el => {
    el.textContent = userName;
  });

  document.querySelectorAll(".sidebar-user-card .user-email").forEach(el => {
    el.textContent = userEmail;
  });

  document.querySelectorAll(".sidebar-user-card .user-avatar-purple, .sidebar-user-card [class*='user-avatar']").forEach(el => {
    el.textContent = avatarChar;
  });

  document.querySelectorAll(".sidebar-user-card .user-panel-badge").forEach(el => {
    el.textContent = sessionUser.role === "admin" ? "ADMIN PANEL" : "USER PANEL";
  });

  // 2. Update Header User Profile (.user-info-text h4 & p)
  document.querySelectorAll(".user-info-text h4, .header-user-profile h4").forEach(el => {
    el.textContent = userName;
  });

  document.querySelectorAll(".user-info-text p, .header-user-profile p").forEach(el => {
    el.textContent = userRole;
  });

  // 3. Update Settings Form Fields if present
  const profileNameInput = document.querySelector("#clientProfileForm input[type='text']");
  const profileEmailInput = document.querySelector("#clientProfileForm input[type='email']");
  if (profileNameInput && userName) profileNameInput.value = userName;
  if (profileEmailInput && userEmail) profileEmailInput.value = userEmail;
}

window.syncUserSessionProfile = syncUserSessionProfile;

// Immediately execute sync if DOM is already ready
if (document.readyState !== "loading") {
  syncUserSessionProfile();
}
