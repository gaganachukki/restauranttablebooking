/**
 * STACKLY — RESTAURANT TABLE BOOKING PLATFORM
 * Client Dashboard Multi-View Architecture & Logic (js/client-dashboard.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const reservationsGrid = document.getElementById("clientReservationsList");
  const fullReservationsGrid = document.getElementById("clientFullReservationsList");
  const resSearchInput = document.getElementById("clientResSearchInput");
  const dedicatedFavoritesGrid = document.getElementById("clientDedicatedFavoritesList");
  const recommendedGrid = document.getElementById("clientRecommendationsList");
  const exploreGrid = document.getElementById("clientExploreGrid");
  const exploreSearchInput = document.getElementById("clientExploreSearch");
  const profileForm = document.getElementById("clientProfileForm");
  const supportForm = document.getElementById("clientSupportTicketForm");
  const progressBarFill = document.querySelector(".tracker-progress-bar-fill");

  let activeResFilter = "all";
  let activeFavFilter = "all";
  let activeCityFilter = "all";

  // 1. Animate Reservation Tracker Progress on Load
  if (progressBarFill) {
    setTimeout(() => {
      progressBarFill.style.width = "66%"; // Step 3: Confirmed
    }, 400);
  }

  // 2. Render Client Reservations (Both Overview & Full View)
  function renderClientReservations() {
    if (typeof StacklyData === "undefined") return;

    const allReservations = StacklyData.getReservations();
    const query = resSearchInput ? resSearchInput.value.toLowerCase().trim() : "";

    // 2A. Snapshot on Dashboard Overview (First 2-3)
    if (reservationsGrid) {
      const snapshot = allReservations.slice(0, 2);
      if (snapshot.length === 0) {
        reservationsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 32px; text-align: center; background: var(--color-white); border-radius: 14px; border: 1px dashed var(--color-border);">
            <p style="color: var(--color-muted); margin-bottom: 12px;">No active table reservations logged.</p>
            <a href="404.html" class="btn btn-primary btn-sm">Book a Table Now →</a>
          </div>
        `;
      } else {
        reservationsGrid.innerHTML = snapshot.map(res => buildReservationCardHTML(res)).join("");
      }
    }

    // 2B. Full Reservations View with Filtering & Search
    if (fullReservationsGrid) {
      let filtered = allReservations;

      if (activeResFilter !== "all") {
        filtered = filtered.filter(r => r.status.toLowerCase() === activeResFilter.toLowerCase());
      }

      if (query) {
        filtered = filtered.filter(r =>
          r.id.toLowerCase().includes(query) ||
          r.restaurantName.toLowerCase().includes(query) ||
          (r.occasion && r.occasion.toLowerCase().includes(query))
        );
      }

      if (filtered.length === 0) {
        fullReservationsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 48px; text-align: center; background: var(--color-white); border-radius: 16px; border: 1px dashed var(--color-border);">
            <p style="color: var(--color-muted); font-size: 0.9375rem; margin-bottom: 16px;">No reservations found matching your current filter.</p>
            <a href="404.html" class="btn btn-outline-green btn-sm">Explore Restaurants to Book →</a>
          </div>
        `;
      } else {
        fullReservationsGrid.innerHTML = filtered.map(res => buildReservationCardHTML(res)).join("");
      }
    }

    attachReservationCardEvents();
  }

  function buildReservationCardHTML(res) {
    const rest = StacklyData.getRestaurants().find(r => r.id === res.restaurantId || r.name === res.restaurantName);
    const img = rest ? rest.image : "assets/images/featured-olive-table.webp";
    const statusClass = res.status.toLowerCase();

    return `
      <div class="client-res-card" data-id="${res.id}">
        <img src="${img}" alt="${res.restaurantName}" class="client-res-thumb">
        <div class="client-res-content">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <h4 style="font-size: 1.125rem; font-family: var(--font-display); font-weight: 600;">${res.restaurantName}</h4>
              <span class="status-pill ${statusClass}">${res.status}</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--color-muted); font-weight: 600;">Booking ID: ${res.id}</span>
            
            <div class="client-res-meta">
              <span class="client-res-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${res.date} at ${res.time}
              </span>
              <span class="client-res-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                ${res.guests} Guests (${res.occasion || 'Dining'})
              </span>
            </div>
          </div>

          <div class="client-res-actions">
            <a href="404.html" class="btn btn-secondary btn-sm client-view-details" data-id="${res.id}">Details</a>
            ${res.status !== 'Cancelled' ? `<a href="404.html" class="btn btn-outline-green btn-sm client-cancel-res" data-id="${res.id}" style="color: var(--color-error); border-color: #FCA5A5; text-decoration: none;">Cancel</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function attachReservationCardEvents() {
    // All reservation card buttons lead directly to 404 page without any alert/confirm message
    document.querySelectorAll(".client-cancel-res, .client-view-details").forEach(btn => {
      btn.addEventListener("click", () => {
        window.location.href = "404.html";
      });
    });
  }

  // Reservation Filter Tabs
  document.querySelectorAll("[data-res-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-res-filter]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeResFilter = btn.dataset.resFilter;
      renderClientReservations();
    });
  });

  if (resSearchInput) {
    resSearchInput.addEventListener("input", renderClientReservations);
  }

  // 3. Render Favorites
  function renderClientFavorites() {
    if (!dedicatedFavoritesGrid || typeof StacklyData === "undefined") return;

    const favIds = StacklyData.getFavorites();
    let restaurants = StacklyData.getRestaurants().filter(r => favIds.includes(r.id));

    if (activeFavFilter !== "all") {
      restaurants = restaurants.filter(r => 
        (r.category && r.category.toLowerCase().includes(activeFavFilter.toLowerCase())) ||
        (r.cuisine && r.cuisine.toLowerCase().includes(activeFavFilter.toLowerCase()))
      );
    }

    if (restaurants.length === 0) {
      dedicatedFavoritesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 48px; text-align: center; background: var(--color-white); border-radius: 16px; border: 1px dashed var(--color-border);">
          <p style="color: var(--color-muted); font-size: 0.9375rem; margin-bottom: 14px;">No favorite dining venues saved in this category.</p>
          <button class="btn btn-primary btn-sm" data-jump-view="explore-restaurants">Browse All Partner Restaurants →</button>
        </div>
      `;
      return;
    }

    dedicatedFavoritesGrid.innerHTML = restaurants.map(r => `
      <div class="favorite-item-card">
        <img src="${r.image}" alt="${r.name}" class="favorite-item-thumb">
        <div class="favorite-item-body">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
            <h4 style="font-size: 1.0625rem; font-family: var(--font-display);">${r.name}</h4>
            <span style="color: var(--color-gold); font-size: 0.8125rem; font-weight: 600;">★ ${r.rating}</span>
          </div>
          <p style="font-size: 0.8125rem; color: var(--color-muted); margin-bottom: 14px;">${r.cuisine} • ${r.city} • ₹${r.pricePerson}/person</p>
          <div style="display: flex; gap: 8px;">
            <a href="404.html" class="btn btn-primary btn-sm client-instant-book-btn" data-resto="${r.name}" data-id="${r.id}" style="flex: 1.2; padding: 8px 12px; font-size: 0.75rem; text-decoration: none;">Reserve Table</a>
            <button class="btn btn-sm remove-fav-btn" data-id="${r.id}" style="color: var(--color-error); border: 1px solid #FECACA; padding: 8px 12px; font-size: 0.75rem;" title="Remove from favorites">Remove</button>
          </div>
        </div>
      </div>
    `).join("");

    // Remove event
    document.querySelectorAll(".remove-fav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        StacklyData.toggleFavorite(id);
        renderClientFavorites();
        if (typeof showToast === "function") showToast("Removed from saved favorites.");
      });
    });

    // Reserve table event -> navigate directly to 404
    document.querySelectorAll(".client-instant-book-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        window.location.href = "404.html";
      });
    });
  }

  // Favorite Filter Pills
  document.querySelectorAll("[data-fav-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-fav-filter]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFavFilter = btn.dataset.favFilter;
      renderClientFavorites();
    });
  });

  // 4. Render Recommended Restaurants
  function renderClientRecommendations() {
    if (!recommendedGrid || typeof StacklyData === "undefined") return;

    const list = StacklyData.getRestaurants().slice(0, 4);
    recommendedGrid.innerHTML = list.map(r => `
      <div style="background-color: var(--color-white); border: 1px solid var(--color-border); border-radius: 14px; overflow: hidden; display: flex; align-items: center; gap: 14px; padding: 12px;">
        <img src="${r.image}" alt="${r.name}" style="width: 68px; height: 68px; border-radius: 10px; object-fit: cover; flex-shrink: 0;">
        <div style="flex: 1;">
          <h4 style="font-size: 0.9375rem; font-weight: 600; margin-bottom: 2px;">${r.name}</h4>
          <p style="font-size: 0.75rem; color: var(--color-muted); margin-bottom: 4px;">${r.cuisine} • ₹${r.pricePerson}/person</p>
          <span style="font-size: 0.6875rem; font-weight: 600; color: var(--color-green); background: var(--color-sage); padding: 2px 8px; border-radius: 9999px;">★ ${r.rating} Recommended</span>
        </div>
        <a href="404.html" class="btn btn-outline-green btn-sm client-instant-book-btn" data-resto="${r.name}" data-id="${r.id}" style="padding: 6px 12px; font-size: 0.75rem; text-decoration: none;">Book</a>
      </div>
    `).join("");

    document.querySelectorAll("#clientRecommendationsList .client-instant-book-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        window.location.href = "404.html";
      });
    });
  }

  // 5. Render Explore Restaurants Grid
  function renderClientExplore() {
    if (!exploreGrid || typeof StacklyData === "undefined") return;

    let list = StacklyData.getRestaurants();
    const query = exploreSearchInput ? exploreSearchInput.value.toLowerCase().trim() : "";

    if (activeCityFilter !== "all") {
      list = list.filter(r => r.city.toLowerCase() === activeCityFilter.toLowerCase());
    }

    if (query) {
      list = list.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.cuisine.toLowerCase().includes(query) ||
        r.city.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query)
      );
    }

    if (list.length === 0) {
      exploreGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 48px; text-align: center; background: var(--color-white); border-radius: 16px; border: 1px dashed var(--color-border);">
          <p style="color: var(--color-muted); font-size: 0.9375rem;">No partner venues found matching your search.</p>
        </div>
      `;
      return;
    }

    exploreGrid.innerHTML = list.map(r => `
      <div class="explore-card">
        <img src="${r.image}" alt="${r.name}" class="explore-card-img">
        <div class="explore-card-body">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
              <h4 style="font-size: 1.125rem; font-family: var(--font-display); font-weight: 600;">${r.name}</h4>
              <span style="color: var(--color-gold); font-size: 0.8125rem; font-weight: 600;">★ ${r.rating}</span>
            </div>
            <p style="font-size: 0.8125rem; color: var(--color-muted); margin-bottom: 6px;">${r.cuisine} • ${r.city}</p>
            <p style="font-size: 0.75rem; color: var(--color-charcoal); margin-bottom: 14px;">${r.location}</p>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: 12px; margin-top: 6px;">
            <span style="font-size: 0.8125rem; font-weight: 600; color: var(--color-green);">₹${r.pricePerson} / guest</span>
            <a href="404.html" class="btn btn-primary btn-sm client-instant-book-btn" data-resto="${r.name}" data-id="${r.id}" style="padding: 7px 14px; font-size: 0.8125rem; text-decoration: none;">Reserve Table</a>
          </div>
        </div>
      </div>
    `).join("");

    exploreGrid.querySelectorAll(".client-instant-book-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        window.location.href = "404.html";
      });
    });
  }

  // Explore City Filters
  document.querySelectorAll("[data-explore-city]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-explore-city]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCityFilter = btn.dataset.exploreCity;
      renderClientExplore();
    });
  });

  if (exploreSearchInput) {
    exploreSearchInput.addEventListener("input", renderClientExplore);
  }

  // Remove booking modal form entirely from page
  const existingModal = document.getElementById("clientBookingModal");
  if (existingModal) existingModal.remove();

  // Global reserve table button handler to navigate directly to 404
  document.addEventListener("click", (e) => {
    const reserveBtn = e.target.closest(".client-instant-book-btn");
    if (reserveBtn) {
      window.location.href = "404.html";
    }
  });

  // 7. Profile Form Submission
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = profileForm.querySelector("input[type='text']");
      const emailInput = profileForm.querySelector("input[type='email']");
      if (nameInput && emailInput) {
        let sessionUser = JSON.parse(sessionStorage.getItem("stackly_user") || localStorage.getItem("stackly_user") || "{}");
        sessionUser.name = nameInput.value.trim() || sessionUser.name;
        sessionUser.email = emailInput.value.trim() || sessionUser.email;
        sessionUser.avatarInitial = sessionUser.name ? sessionUser.name.charAt(0).toUpperCase() : "U";
        sessionStorage.setItem("stackly_user", JSON.stringify(sessionUser));
        localStorage.setItem("stackly_user", JSON.stringify(sessionUser));
        if (typeof window.syncUserSessionProfile === "function") {
          window.syncUserSessionProfile();
        }
      }
      if (typeof showToast === "function") {
        showToast("Profile & dining preferences updated successfully!");
      } else {
        alert("Profile & dining preferences updated successfully!");
      }
    });
  }

  // 8. Support Ticket Submission
  if (supportForm) {
    supportForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (typeof showToast === "function") {
        showToast("Support ticket logged! Maître d' Laurent will contact you within 15 minutes.");
      } else {
        alert("Support ticket logged! Maître d' Laurent will contact you within 15 minutes.");
      }
      supportForm.reset();
    });
  }

  // 9. Initial Render Calls
  renderClientReservations();
  renderClientFavorites();
  renderClientRecommendations();
  renderClientExplore();
});
