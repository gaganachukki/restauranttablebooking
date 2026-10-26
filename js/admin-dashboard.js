/**
 * STACKLY — RESTAURANT TABLE BOOKING PLATFORM
 * Admin Dashboard Management & Analytics (js/admin-dashboard.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const overviewReservationsTableBody = document.getElementById("adminOverviewReservationsTableBody");
  const reservationsTableBody = document.getElementById("adminReservationsTableBody");
  const searchInput = document.getElementById("adminResSearch");
  const statusFilter = document.getElementById("adminResStatusFilter");
  const exportCsvBtn = document.getElementById("exportReservationsBtn");
  const restaurantMgmtBody = document.getElementById("adminRestaurantMgmtBody");
  const addRestaurantBtn = document.getElementById("openAddRestaurantModalBtn");
  const customersTableBody = document.getElementById("adminCustomersTableBody");
  const customerSearchInput = document.getElementById("adminCustomerSearchInput");
  const adminSettingsForm = document.getElementById("adminSettingsForm");

  // 1. KPI Counter Animation
  function animateValue(obj, start, end, duration, prefix = "", suffix = "") {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const val = Math.floor(progress * (end - start) + start);
      obj.innerHTML = prefix + val.toLocaleString() + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  const kpiRestaurants = document.getElementById("kpiTotalRestaurants");
  const kpiTodayRes = document.getElementById("kpiTodayReservations");
  const kpiPending = document.getElementById("kpiPendingRequests");
  const kpiRevenue = document.getElementById("kpiDemoRevenue");

  if (kpiRestaurants) animateValue(kpiRestaurants, 0, 128, 1200);
  if (kpiTodayRes) animateValue(kpiTodayRes, 0, 64, 1200);
  if (kpiPending) animateValue(kpiPending, 0, 12, 1000);
  if (kpiRevenue) animateValue(kpiRevenue, 0, 84200, 1500, "₹");

  // 2. Render Reservations (Overview snapshot + Master Table)
  function renderAdminReservations() {
    if (typeof StacklyData === "undefined") return;

    let reservations = StacklyData.getReservations();

    // 2A. Overview Snapshot (First 5)
    if (overviewReservationsTableBody) {
      const snapshot = reservations.slice(0, 5);
      overviewReservationsTableBody.innerHTML = snapshot.map(r => {
        const statusClass = r.status.toLowerCase();
        return `
          <tr>
            <td><strong>${r.id}</strong></td>
            <td>
              <div style="font-weight: 600;">${r.restaurantName}</div>
              <span style="font-size: 0.75rem; color: var(--color-muted);">${r.occasion || 'Dining'}</span>
            </td>
            <td>
              <div>${r.guestName}</div>
              <div style="font-size: 0.75rem; color: var(--color-muted);">${r.phone || r.email}</div>
            </td>
            <td>${r.date}</td>
            <td>${r.time}</td>
            <td>${r.guests} Guests</td>
            <td><span class="status-pill ${statusClass}">${r.status}</span></td>
          </tr>
        `;
      }).join("");
    }

    // 2B. Master Reservations Table
    if (reservationsTableBody) {
      const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
      const filterStatus = statusFilter ? statusFilter.value : "all";

      let filtered = reservations;

      if (query) {
        filtered = filtered.filter(r => 
          r.id.toLowerCase().includes(query) ||
          r.restaurantName.toLowerCase().includes(query) ||
          r.guestName.toLowerCase().includes(query)
        );
      }

      if (filterStatus !== "all") {
        filtered = filtered.filter(r => r.status.toLowerCase() === filterStatus.toLowerCase());
      }

      if (filtered.length === 0) {
        reservationsTableBody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 36px; color: var(--color-muted);">
              No demonstration reservations found matching criteria.
            </td>
          </tr>
        `;
      } else {
        reservationsTableBody.innerHTML = filtered.map(r => `
          <tr data-id="${r.id}">
            <td><strong>${r.id}</strong></td>
            <td>
              <div style="font-weight: 600;">${r.restaurantName}</div>
              <span style="font-size: 0.75rem; color: var(--color-muted);">${r.occasion || 'Dining'}</span>
            </td>
            <td>
              <div>${r.guestName}</div>
              <div style="font-size: 0.75rem; color: var(--color-muted);">${r.phone || r.email}</div>
            </td>
            <td>${r.date}</td>
            <td>${r.time}</td>
            <td>${r.guests}</td>
            <td>
              <select class="table-status-select" data-id="${r.id}">
                <option value="Confirmed" ${r.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="Pending" ${r.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Completed" ${r.status === 'Completed' ? 'selected' : ''}>Completed</option>
                <option value="Cancelled" ${r.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </td>
            <td>
              <div class="table-actions">
                <button class="table-action-icon-btn delete" data-id="${r.id}" title="Remove reservation">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        `).join("");
      }

      attachReservationActions();
    }
  }

  function attachReservationActions() {
    // Status Select Change
    document.querySelectorAll(".table-status-select").forEach(select => {
      select.addEventListener("change", (e) => {
        const id = select.dataset.id;
        const newStatus = e.target.value;
        const list = StacklyData.getReservations();
        const item = list.find(r => r.id === id);
        if (item) {
          item.status = newStatus;
          StacklyData.saveReservations(list);
          renderAdminReservations();
          if (typeof showToast === "function") showToast(`Reservation ${id} updated to ${newStatus}.`);
        }
      });
    });

    // Delete Reservation
    document.querySelectorAll(".table-action-icon-btn.delete").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (confirm(`Are you sure you want to remove reservation ${id}?`)) {
          let list = StacklyData.getReservations();
          list = list.filter(r => r.id !== id);
          StacklyData.saveReservations(list);
          renderAdminReservations();
          if (typeof showToast === "function") showToast(`Reservation ${id} deleted.`);
        }
      });
    });
  }

  if (searchInput) searchInput.addEventListener("input", renderAdminReservations);
  if (statusFilter) statusFilter.addEventListener("change", renderAdminReservations);

  // Export CSV
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
      const list = StacklyData.getReservations();
      let csv = "ID,Restaurant,Guest,Date,Time,Guests,Status,Phone\n";
      list.forEach(r => {
        csv += `"${r.id}","${r.restaurantName}","${r.guestName}","${r.date}","${r.time}","${r.guests}","${r.status}","${r.phone || ''}"\n`;
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "stackly_reservations.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (typeof showToast === "function") showToast("Reservations exported to stackly_reservations.csv");
    });
  }

  // 3. Render Restaurant Management Table
  function renderRestaurantManagement() {
    if (!restaurantMgmtBody || typeof StacklyData === "undefined") return;

    const list = StacklyData.getRestaurants();
    restaurantMgmtBody.innerHTML = list.map(r => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${r.image}" alt="${r.name}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;">
            <div>
              <div style="font-weight: 600;">${r.name}</div>
              <span style="font-size: 0.75rem; color: var(--color-muted);">${r.category}</span>
            </div>
          </div>
        </td>
        <td>${r.cuisine}</td>
        <td>${r.city}</td>
        <td><span style="color: var(--color-gold); font-weight: 600;">★ ${r.rating}</span></td>
        <td>₹${r.pricePerson}</td>
        <td><span class="status-pill confirmed">Active Listed</span></td>
        <td>
          <div class="table-actions">
            <button class="table-action-icon-btn edit-rest-btn" data-id="${r.id}" title="Edit restaurant">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button class="table-action-icon-btn delete delete-rest-btn" data-id="${r.id}" title="Delete restaurant">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join("");

    // Delete Restaurant
    document.querySelectorAll(".delete-rest-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (confirm("Remove this restaurant from the demonstration directory?")) {
          let current = StacklyData.getRestaurants();
          current = current.filter(item => item.id !== id);
          StacklyData.saveRestaurants(current);
          renderRestaurantManagement();
          if (typeof showToast === "function") showToast("Restaurant removed.");
        }
      });
    });

    // Edit Restaurant
    document.querySelectorAll(".edit-rest-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        openRestaurantCrudModal(id);
      });
    });
  }

  // 4. Restaurant CRUD Modal
  function openRestaurantCrudModal(editId = null) {
    let modal = document.getElementById("restaurantCrudModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "restaurantCrudModal";
      modal.className = "crud-modal-backdrop";
      document.body.appendChild(modal);
    }

    let existing = null;
    if (editId) {
      existing = StacklyData.getRestaurants().find(r => r.id === editId);
    }

    modal.innerHTML = `
      <div class="crud-modal-window">
        <button class="modal-close-btn crud-close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <h3 style="font-size: 1.375rem; margin-bottom: 6px; font-family: var(--font-display);">${existing ? 'Edit Restaurant Listing' : 'Add New Restaurant Listing'}</h3>
        <p style="font-size: 0.8125rem; color: var(--color-muted); margin-bottom: 24px;">Manage partner establishment profiles, city tags, and pricing.</p>
        
        <form id="crudRestaurantForm" style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group">
              <label class="form-label">Restaurant Name</label>
              <input type="text" id="crudName" class="form-control" value="${existing ? existing.name : ''}" required placeholder="e.g. Amber Bistro">
            </div>
            <div class="form-group">
              <label class="form-label">Cuisine Type</label>
              <input type="text" id="crudCuisine" class="form-control" value="${existing ? existing.cuisine : ''}" required placeholder="e.g. Italian & Mediterranean">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group">
              <label class="form-label">City</label>
              <select id="crudCity" class="form-control">
                <option value="Chennai" ${existing && existing.city === 'Chennai' ? 'selected' : ''}>Chennai</option>
                <option value="Bengaluru" ${existing && existing.city === 'Bengaluru' ? 'selected' : ''}>Bengaluru</option>
                <option value="Coimbatore" ${existing && existing.city === 'Coimbatore' ? 'selected' : ''}>Coimbatore</option>
                <option value="Salem" ${existing && existing.city === 'Salem' ? 'selected' : ''}>Salem</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select id="crudCategory" class="form-control">
                <option value="Fine Dining" ${existing && existing.category === 'Fine Dining' ? 'selected' : ''}>Fine Dining</option>
                <option value="Italian" ${existing && existing.category === 'Italian' ? 'selected' : ''}>Italian</option>
                <option value="Indian" ${existing && existing.category === 'Indian' ? 'selected' : ''}>Indian</option>
                <option value="Japanese" ${existing && existing.category === 'Japanese' ? 'selected' : ''}>Japanese</option>
                <option value="Rooftop Dining" ${existing && existing.category === 'Rooftop Dining' ? 'selected' : ''}>Rooftop Dining</option>
                <option value="Family Restaurants" ${existing && existing.category === 'Family Restaurants' ? 'selected' : ''}>Family Restaurants</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group">
              <label class="form-label">Approx. Price per Guest (₹)</label>
              <input type="number" id="crudPrice" class="form-control" value="${existing ? existing.pricePerson : 850}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Location / Neighborhood</label>
              <input type="text" id="crudLocation" class="form-control" value="${existing ? existing.location : ''}" required placeholder="e.g. Indiranagar, Bengaluru">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Short Description</label>
            <textarea id="crudDescription" class="form-control" rows="2">${existing ? existing.description : 'A refined dining atmosphere serving exquisite dishes with exceptional hospitality.'}</textarea>
          </div>

          <div style="display: flex; gap: 12px; margin-top: 12px;">
            <button type="button" class="btn btn-secondary crud-cancel-btn" style="flex: 1;">Cancel</button>
            <button type="submit" class="btn btn-primary" style="flex: 1.5;">${existing ? 'Save Changes' : 'Add Restaurant'}</button>
          </div>
        </form>
      </div>
    `;

    modal.classList.add("show");

    modal.querySelector(".crud-close-btn").addEventListener("click", () => modal.classList.remove("show"));
    modal.querySelector(".crud-cancel-btn").addEventListener("click", () => modal.classList.remove("show"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });

    const form = modal.querySelector("#crudRestaurantForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const list = StacklyData.getRestaurants();

      if (existing) {
        existing.name = document.getElementById("crudName").value.trim();
        existing.cuisine = document.getElementById("crudCuisine").value.trim();
        existing.city = document.getElementById("crudCity").value;
        existing.category = document.getElementById("crudCategory").value;
        existing.pricePerson = parseInt(document.getElementById("crudPrice").value, 10);
        existing.location = document.getElementById("crudLocation").value.trim();
        existing.description = document.getElementById("crudDescription").value.trim();
      } else {
        const newRest = {
          id: "REST-0" + (list.length + 1).toString().padStart(2, '0'),
          name: document.getElementById("crudName").value.trim(),
          cuisine: document.getElementById("crudCuisine").value.trim(),
          category: document.getElementById("crudCategory").value,
          location: document.getElementById("crudLocation").value.trim(),
          city: document.getElementById("crudCity").value,
          address: document.getElementById("crudLocation").value.trim() + ", " + document.getElementById("crudCity").value,
          rating: 4.8,
          reviewsCount: 120,
          pricePerson: parseInt(document.getElementById("crudPrice").value, 10),
          priceTag: "₹₹₹",
          hours: "12:00 PM – 11:00 PM",
          image: "assets/images/featured-olive-table.webp",
          timeSlots: ["7:00 PM", "7:45 PM", "8:30 PM", "9:15 PM"],
          featured: false,
          popular: true,
          occasion: ["Casual Dining", "Family Gatherings"],
          description: document.getElementById("crudDescription").value.trim()
        };
        list.unshift(newRest);
      }

      StacklyData.saveRestaurants(list);
      modal.classList.remove("show");
      renderRestaurantManagement();
      if (typeof showToast === "function") showToast(existing ? "Restaurant updated successfully." : "New restaurant added successfully!");
    });
  }

  if (addRestaurantBtn) {
    addRestaurantBtn.addEventListener("click", () => openRestaurantCrudModal(null));
  }

  // 5. Render Customers Table
  function renderCustomers() {
    if (!customersTableBody || typeof StacklyData === "undefined") return;

    let customers = StacklyData.getCustomers();
    const query = customerSearchInput ? customerSearchInput.value.toLowerCase().trim() : "";

    if (query) {
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query)
      );
    }

    if (customers.length === 0) {
      customersTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 32px; color: var(--color-muted);">
            No patrons found matching search.
          </td>
        </tr>
      `;
      return;
    }

    customersTableBody.innerHTML = customers.map(c => `
      <tr>
        <td><strong>${c.id}</strong></td>
        <td>
          <div style="font-weight: 600;">${c.name}</div>
          <div style="font-size: 0.75rem; color: var(--color-muted);">${c.email}</div>
        </td>
        <td>${c.phone}</td>
        <td><strong>${c.reservationsCount}</strong> Bookings</td>
        <td><span class="status-pill confirmed">${c.status}</span></td>
        <td>${c.memberSince}</td>
      </tr>
    `).join("");
  }

  if (customerSearchInput) {
    customerSearchInput.addEventListener("input", renderCustomers);
  }

  // 6. Settings Form Submit
  if (adminSettingsForm) {
    adminSettingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (typeof showToast === "function") {
        showToast("Platform & booking engine configuration saved successfully!");
      } else {
        alert("Platform & booking engine configuration saved successfully!");
      }
    });
  }

  // Initial Runs
  renderAdminReservations();
  renderRestaurantManagement();
  renderCustomers();
});
