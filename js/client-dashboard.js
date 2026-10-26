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
            <button class="btn btn-primary btn-sm" data-jump-view="explore-restaurants">Book a Table Now →</button>
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
            <button class="btn btn-outline-green btn-sm" data-jump-view="explore-restaurants">Explore Restaurants to Book →</button>
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
            <button class="btn btn-secondary btn-sm client-view-details" data-id="${res.id}">Details</button>
            ${res.status !== 'Cancelled' ? `<button class="btn btn-outline-green btn-sm client-cancel-res" data-id="${res.id}" style="color: var(--color-error); border-color: #FCA5A5;">Cancel</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function attachReservationCardEvents() {
    // Cancel Reservation
    document.querySelectorAll(".client-cancel-res").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (confirm(`Do you wish to cancel reservation ${id}?`)) {
          const list = StacklyData.getReservations();
          const item = list.find(r => r.id === id);
          if (item) {
            item.status = "Cancelled";
            StacklyData.saveReservations(list);
            renderClientReservations();
            if (typeof showToast === "function") showToast(`Reservation ${id} has been cancelled.`);
          }
        }
      });
    });

    // View Details Modal
    document.querySelectorAll(".client-view-details").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const res = StacklyData.getReservations().find(r => r.id === id);
        if (res) {
          alert(`STACKLY Reservation Summary:\n\nReservation ID: ${res.id}\nVenue: ${res.restaurantName}\nDate: ${res.date}\nTime: ${res.time}\nParty Size: ${res.guests} Guests\nOccasion: ${res.occasion || 'Standard Dining'}\nSpecial Notes: ${res.specialRequests || 'Standard hospitality arrangement'}\nCurrent Status: ${res.status}`);
        }
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
            <button class="btn btn-primary btn-sm client-instant-book-btn" data-resto="${r.name}" data-id="${r.id}" style="flex: 1.2; padding: 8px 12px; font-size: 0.75rem;">Reserve Table</button>
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

    // Instant book event
    document.querySelectorAll(".client-instant-book-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        openClientBookingModal(btn.dataset.resto, btn.dataset.id);
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
        <button class="btn btn-outline-green btn-sm client-instant-book-btn" data-resto="${r.name}" data-id="${r.id}" style="padding: 6px 12px; font-size: 0.75rem;">Book</button>
      </div>
    `).join("");

    document.querySelectorAll("#clientRecommendationsList .client-instant-book-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        openClientBookingModal(btn.dataset.resto, btn.dataset.id);
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
            <button class="btn btn-primary btn-sm client-instant-book-btn" data-resto="${r.name}" data-id="${r.id}" style="padding: 7px 14px; font-size: 0.8125rem;">Reserve Table</button>
          </div>
        </div>
      </div>
    `).join("");

    exploreGrid.querySelectorAll(".client-instant-book-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        openClientBookingModal(btn.dataset.resto, btn.dataset.id);
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

  // 6. Quick In-Dashboard Booking Modal
  function openClientBookingModal(presetName = "The Olive Table", presetId = null) {
    let modal = document.getElementById("clientBookingModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "clientBookingModal";
      modal.className = "crud-modal-backdrop";
      document.body.appendChild(modal);
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const restaurants = typeof StacklyData !== "undefined" ? StacklyData.getRestaurants() : [];

    modal.innerHTML = `
      <div class="crud-modal-window">
        <button class="modal-close-btn client-book-close-btn" style="position: absolute; top: 20px; right: 20px; background: none; border: none; cursor: pointer;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <h3 style="font-size: 1.375rem; margin-bottom: 6px; font-family: var(--font-display);">Reserve a Table</h3>
        <p style="font-size: 0.8125rem; color: var(--color-muted); margin-bottom: 24px;">Curated dining reservation with instant host confirmation.</p>
        
        <form id="inDashboardBookingForm" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-group">
            <label class="form-label">Selected Restaurant</label>
            <select id="modalBookingRestaurant" class="form-control" required>
              ${restaurants.map(r => `
                <option value="${r.name}" ${r.name === presetName ? 'selected' : ''}>${r.name} (${r.cuisine} • ${r.city})</option>
              `).join("")}
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group">
              <label class="form-label">Reservation Date</label>
              <input type="date" id="modalBookingDate" class="form-control" value="${dateStr}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Seating Time</label>
              <select id="modalBookingTime" class="form-control">
                <option value="7:00 PM">7:00 PM (Dinner)</option>
                <option value="7:45 PM">7:45 PM (Dinner)</option>
                <option value="8:30 PM" selected>8:30 PM (Peak Dinner)</option>
                <option value="9:15 PM">9:15 PM (Late Evening)</option>
                <option value="1:00 PM">1:00 PM (Lunch)</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group">
              <label class="form-label">Number of Guests</label>
              <select id="modalBookingGuests" class="form-control">
                <option value="1">1 Guest (Solo Dining)</option>
                <option value="2" selected>2 Guests (Table for Two)</option>
                <option value="4">4 Guests (Standard Table)</option>
                <option value="6">6 Guests (Celebration Table)</option>
                <option value="8">8 Guests (Private Dining)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Dining Occasion</label>
              <select id="modalBookingOccasion" class="form-control">
                <option value="Casual Dining" selected>Casual Dining</option>
                <option value="Anniversary">Anniversary Celebration</option>
                <option value="Birthday Dinner">Birthday Dinner</option>
                <option value="Business Dinner">Business Dinner</option>
                <option value="Family Gathering">Family Gathering</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Special Seating or Dietary Notes</label>
            <input type="text" id="modalBookingNotes" class="form-control" placeholder="e.g. Quiet corner booth, window view, allergy to shellfish">
          </div>

          <div style="display: flex; gap: 12px; margin-top: 10px;">
            <button type="button" class="btn btn-secondary client-book-cancel-btn" style="flex: 1;">Cancel</button>
            <button type="submit" class="btn btn-primary" style="flex: 1.5;">Confirm Reservation</button>
          </div>
        </form>
      </div>
    `;

    modal.classList.add("show");

    modal.querySelector(".client-book-close-btn").addEventListener("click", () => modal.classList.remove("show"));
    modal.querySelector(".client-book-cancel-btn").addEventListener("click", () => modal.classList.remove("show"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });

    const form = modal.querySelector("#inDashboardBookingForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const rName = document.getElementById("modalBookingRestaurant").value;
      const dateVal = document.getElementById("modalBookingDate").value;
      const timeVal = document.getElementById("modalBookingTime").value;
      const guestsVal = parseInt(document.getElementById("modalBookingGuests").value, 10);
      const occasionVal = document.getElementById("modalBookingOccasion").value;
      const notesVal = document.getElementById("modalBookingNotes").value;

      const newId = "RES-" + (Math.floor(1000 + Math.random() * 9000));

      const newReservation = {
        id: newId,
        restaurantName: rName,
        guestName: "Arun Kumar",
        email: "client@stackly.com",
        phone: "+91 98401 23456",
        date: dateVal,
        time: timeVal,
        guests: guestsVal,
        occasion: occasionVal,
        specialRequests: notesVal,
        status: "Confirmed",
        tableNumber: "T-" + Math.floor(1 + Math.random() * 12)
      };

      const list = StacklyData.getReservations();
      list.unshift(newReservation);
      StacklyData.saveReservations(list);

      modal.classList.remove("show");
      renderClientReservations();

      if (typeof showToast === "function") {
        showToast(`Reservation ${newId} confirmed at ${rName}!`);
      } else {
        alert(`Reservation ${newId} confirmed at ${rName}!`);
      }
    });
  }

  // 7. Profile Form Submission
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
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
