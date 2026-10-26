/**
 * STACKLY — RESTAURANT TABLE BOOKING PLATFORM
 * Restaurant Grid Rendering, Filtering & Sorting (js/restaurant-filter.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const restaurantGrid = document.getElementById("restaurantCardsGrid");
  const categoryContainer = document.getElementById("categoryStrip");
  const cityFilterSelect = document.getElementById("cityFilter");
  const sortFilterSelect = document.getElementById("sortFilter");
  const cuisineTiles = document.querySelectorAll(".cuisine-tile");

  if (!restaurantGrid || typeof StacklyData === "undefined") return;

  let activeCategory = "all";
  let activeCity = "all";
  let activeSort = "rating-desc";

  // Render Restaurants
  function renderRestaurants() {
    let list = StacklyData.getRestaurants();

    // 1. Filter by Category
    if (activeCategory !== "all") {
      const catMap = {
        "fine-dining": ["Fine Dining"],
        "italian": ["Italian", "Italian Classics"],
        "indian": ["Indian", "South Indian", "North Indian & Mughlai"],
        "japanese": ["Japanese"],
        "cafes": ["Cafés", "Artisanal Bakes & Coffee"],
        "seafood": ["Seafood", "Coastal & Seafood"],
        "rooftop": ["Rooftop Dining", "Continental & Fusion", "Modern Fusion"],
        "family": ["Family Restaurants", "Indian"]
      };

      const matchTerms = catMap[activeCategory] || [activeCategory];
      list = list.filter(r => 
        matchTerms.some(term => 
          r.category.toLowerCase().includes(term.toLowerCase()) || 
          r.cuisine.toLowerCase().includes(term.toLowerCase())
        )
      );
    }

    // 2. Filter by City
    if (activeCity !== "all") {
      list = list.filter(r => r.city.toLowerCase() === activeCity.toLowerCase());
    }

    // 3. Sort
    if (activeSort === "rating-desc") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (activeSort === "price-asc") {
      list.sort((a, b) => a.pricePerson - b.pricePerson);
    } else if (activeSort === "price-desc") {
      list.sort((a, b) => b.pricePerson - a.pricePerson);
    }

    if (list.length === 0) {
      restaurantGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--color-ivory); border-radius: var(--radius-lg); border: 1px dashed var(--color-border);">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--color-sage); color: var(--color-green); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
          </div>
          <h3 style="font-size: 1.25rem; margin-bottom: 8px;">No Restaurants Found</h3>
          <p style="font-size: 0.875rem; color: var(--color-muted); max-width: 420px; margin: 0 auto 20px auto;">We couldn't find any restaurants matching your selected filter criteria. Try resetting your filter.</p>
          <button class="btn btn-outline-green btn-sm" id="resetFiltersBtn">Reset All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById("resetFiltersBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          activeCategory = "all";
          activeCity = "all";
          if (cityFilterSelect) cityFilterSelect.value = "all";
          document.querySelectorAll(".category-item").forEach(item => {
            item.classList.toggle("active", item.dataset.category === "all");
          });
          renderRestaurants();
        });
      }
      return;
    }

    restaurantGrid.innerHTML = list.map(r => {
      const isFav = StacklyData.isFavorite(r.id);
      return `
        <div class="restaurant-card" data-id="${r.id}" data-category="${r.category}">
          <div class="restaurant-card-header">
            <img src="${r.image}" alt="${r.name}" loading="lazy">
            <div class="rating-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span>${r.rating}</span>
            </div>
            <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${r.id}" aria-label="Save to favorites">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
          </div>
          <div class="restaurant-card-body">
            <div class="card-title-row">
              <h3 class="restaurant-name">${r.name}</h3>
              <span class="restaurant-price">₹${r.pricePerson} / person</span>
            </div>
            <div class="card-meta-row">
              <span class="card-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
                ${r.location}
              </span>
              <span>•</span>
              <span class="card-meta-item">${r.cuisine}</span>
            </div>
            <div class="card-time-selection">
              <div class="time-selection-label">Available Slots Today</div>
              <div class="slots-pill-group">
                ${r.timeSlots.slice(0, 3).map((slot, idx) => `
                  <button class="slot-btn ${idx === 0 ? 'selected' : ''}" data-slot="${slot}">${slot}</button>
                `).join("")}
              </div>
            </div>
            <div class="card-actions-row">
              <button class="btn btn-secondary btn-sm view-details-btn" data-id="${r.id}">View Details</button>
              <button class="btn btn-primary btn-sm book-table-btn" data-id="${r.id}" data-name="${r.name}">Book a Table</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    attachCardEvents();

    if (window.gsap) {
      gsap.fromTo(".restaurant-card", 
        { y: 20, opacity: 0 }, 
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.4, 
          stagger: 0.05, 
          ease: "power2.out",
          clearProps: "opacity,transform"
        }
      );
    }

    // Refresh ScrollTrigger so all section positions below are accurately calculated
    if (window.ScrollTrigger) {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    }
  }

  // Attach Card Action Events
  function attachCardEvents() {
    // Favorite Button Click
    document.querySelectorAll(".favorite-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const isNowFav = StacklyData.toggleFavorite(id);
        btn.classList.toggle("active", isNowFav);
        const svg = btn.querySelector("svg");
        if (svg) {
          svg.setAttribute("fill", isNowFav ? "currentColor" : "none");
        }
        showToast(isNowFav ? "Added to your saved favorites!" : "Removed from your favorites.");
      });
    });

    // Time slot toggle
    document.querySelectorAll(".slot-btn").forEach(slotBtn => {
      slotBtn.addEventListener("click", () => {
        const parent = slotBtn.parentElement;
        parent.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("selected"));
        slotBtn.classList.add("selected");
      });
    });

    // View Details Modal
    document.querySelectorAll(".view-details-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        openRestaurantDetailsModal(id);
      });
    });

    // Book Table Quick Jump & Autofill
    document.querySelectorAll(".book-table-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const bookingSection = document.getElementById("reservationSection");
        const restSelect = document.getElementById("bookingRestaurantSelect");

        if (restSelect) {
          restSelect.value = id;
        }

        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  // Restaurant Details Modal
  function openRestaurantDetailsModal(id) {
    const r = StacklyData.getRestaurants().find(item => item.id === id);
    if (!r) return;

    let modal = document.getElementById("restaurantDetailModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "restaurantDetailModal";
      modal.className = "modal-backdrop";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-window" style="max-width: 640px; padding: 0; overflow: hidden;">
        <div style="position: relative; height: 260px;">
          <img src="${r.image}" alt="${r.name}" style="width: 100%; height: 100%; object-fit: cover;">
          <button class="modal-close-btn" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.9);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <div style="position: absolute; bottom: 16px; left: 20px; background: rgba(23,35,31,0.85); backdrop-filter: blur(8px); padding: 6px 14px; border-radius: 9999px; color: white; font-size: 0.8125rem; font-weight: 600;">
            ★ ${r.rating} (${r.reviewsCount} reviews) • ${r.priceTag}
          </div>
        </div>
        <div style="padding: 28px;">
          <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px;">
            <h3 style="font-size: 1.625rem; font-family: var(--font-display);">${r.name}</h3>
            <span style="color: var(--color-green); font-weight: 600;">₹${r.pricePerson} / person</span>
          </div>
          <p style="font-size: 0.875rem; color: var(--color-muted); margin-bottom: 16px;">
            <strong>${r.cuisine}</strong> • ${r.category}
          </p>
          <p style="font-size: 0.9375rem; color: var(--color-charcoal); line-height: 1.7; margin-bottom: 24px;">
            ${r.description}
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; padding: 16px; background-color: var(--color-ivory); border-radius: 12px; font-size: 0.8125rem;">
            <div>
              <span style="color: var(--color-muted-light); text-transform: uppercase; font-size: 0.6875rem; font-weight: 600;">Operating Hours</span>
              <p style="font-weight: 500; margin-top: 2px;">${r.hours}</p>
            </div>
            <div>
              <span style="color: var(--color-muted-light); text-transform: uppercase; font-size: 0.6875rem; font-weight: 600;">Location</span>
              <p style="font-weight: 500; margin-top: 2px;">${r.address}</p>
            </div>
          </div>
          <div style="display: flex; gap: 12px;">
            <button class="btn btn-secondary modal-modal-cancel" style="flex: 1;">Close</button>
            <button class="btn btn-primary modal-modal-book" data-id="${r.id}" style="flex: 1.5;">Book a Table Here →</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("show");

    modal.querySelector(".modal-close-btn").addEventListener("click", () => modal.classList.remove("show"));
    modal.querySelector(".modal-modal-cancel").addEventListener("click", () => modal.classList.remove("show"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });

    modal.querySelector(".modal-modal-book").addEventListener("click", () => {
      modal.classList.remove("show");
      const bookingSection = document.getElementById("reservationSection");
      const restSelect = document.getElementById("bookingRestaurantSelect");
      if (restSelect) restSelect.value = r.id;
      if (bookingSection) bookingSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Category Strip Interaction
  document.querySelectorAll(".category-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".category-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      activeCategory = item.dataset.category || "all";
      renderRestaurants();
    });
  });

  // City & Sort Dropdowns
  if (cityFilterSelect) {
    cityFilterSelect.addEventListener("change", (e) => {
      activeCity = e.target.value;
      renderRestaurants();
    });
  }

  if (sortFilterSelect) {
    sortFilterSelect.addEventListener("change", (e) => {
      activeSort = e.target.value;
      renderRestaurants();
    });
  }

  // Cuisine Editorial Tiles Click -> Filter & Scroll
  cuisineTiles.forEach(tile => {
    tile.addEventListener("click", () => {
      const cat = tile.dataset.cuisine;
      if (cat) {
        activeCategory = cat;
        document.querySelectorAll(".category-item").forEach(item => {
          item.classList.toggle("active", item.dataset.category === cat);
        });
        const section = document.getElementById("featuredRestaurants");
        if (section) section.scrollIntoView({ behavior: "smooth" });
        renderRestaurants();
      }
    });
  });

  // Initial render
  renderRestaurants();
});

// Helper Toast Alert
function showToast(message, isError = false) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${isError ? 'error' : ''}`;
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${isError ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'}
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
