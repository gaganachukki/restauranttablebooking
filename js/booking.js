/**
 * STACKLY — RESTAURANT TABLE BOOKING PLATFORM
 * Table Booking Form & Hero Search Bar Handling (js/booking.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("tableBookingForm");
  const restaurantSelect = document.getElementById("bookingRestaurantSelect");
  const dateInput = document.getElementById("bookingDate");
  const timeSelect = document.getElementById("bookingTime");
  const guestsSelect = document.getElementById("bookingGuests");
  const occasionSelect = document.getElementById("bookingOccasion");
  const nameInput = document.getElementById("bookingName");
  const emailInput = document.getElementById("bookingEmail");
  const phoneInput = document.getElementById("bookingPhone");
  const requestsInput = document.getElementById("bookingRequests");

  // Hero Quick Booking Elements
  const heroCity = document.getElementById("heroBookingCity");
  const heroDate = document.getElementById("heroBookingDate");
  const heroGuests = document.getElementById("heroBookingGuests");
  const heroFindBtn = document.getElementById("heroFindTableBtn");

  // 1. Set Min Date for Date Pickers (Today's Date)
  const todayStr = new Date().toISOString().split("T")[0];
  if (dateInput) {
    dateInput.min = todayStr;
  }
  if (heroDate) {
    heroDate.min = todayStr;
    heroDate.value = todayStr;
  }

  // 2. Populate Restaurant Selector
  if (restaurantSelect && typeof StacklyData !== "undefined") {
    const restaurants = StacklyData.getRestaurants();
    restaurantSelect.innerHTML = `<option value="">Select a Restaurant...</option>` +
      restaurants.map(r => `<option value="${r.id}">${r.name} (${r.location})</option>`).join("");
  }

  // 3. Clear errors dynamically as user inputs
  if (bookingForm) {
    [restaurantSelect, dateInput, timeSelect, guestsSelect, occasionSelect, nameInput, emailInput, phoneInput].forEach(elem => {
      if (!elem) return;
      elem.addEventListener("input", () => {
        if (typeof Validation !== "undefined") Validation.clearError(elem);
      });
      elem.addEventListener("change", () => {
        if (typeof Validation !== "undefined") Validation.clearError(elem);
      });
    });
  }

  // 4. Hero Quick Booking Bar Submission
  if (heroFindBtn) {
    heroFindBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const selectedCity = heroCity ? heroCity.value : "Chennai";
      const selectedDate = heroDate ? heroDate.value : todayStr;
      const selectedGuests = heroGuests ? heroGuests.value : "2 Guests";

      // Prefill into main booking section
      if (dateInput) dateInput.value = selectedDate;
      if (guestsSelect) guestsSelect.value = selectedGuests;

      // Filter restaurant selector by selected city if possible
      if (restaurantSelect && typeof StacklyData !== "undefined") {
        const matching = StacklyData.getRestaurants().find(r => r.city.toLowerCase() === selectedCity.toLowerCase());
        if (matching) restaurantSelect.value = matching.id;
      }

      // Smooth scroll to booking section
      const section = document.getElementById("reservationSection");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // 5. Hero Floating Card "Book a Table" Click
  const heroCardBookBtn = document.querySelector(".card-book-btn");
  if (heroCardBookBtn) {
    heroCardBookBtn.addEventListener("click", () => {
      if (restaurantSelect) restaurantSelect.value = "REST-001"; // The Olive Table
      const section = document.getElementById("reservationSection");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    });
  }

  // 6. Main Reservation Form Submission
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (typeof Validation === "undefined") return;

      const isRestValid = Validation.validateRequired(restaurantSelect, "Restaurant selection");
      const isDateValid = Validation.validateDateNotPast(dateInput);
      const isTimeValid = Validation.validateRequired(timeSelect, "Preferred dining time");
      const isGuestsValid = Validation.validateRequired(guestsSelect, "Guest count");
      const isNameValid = Validation.validateRequired(nameInput, "Your full name");
      const isEmailValid = Validation.validateEmail(emailInput);
      const isPhoneValid = Validation.validatePhone(phoneInput);

      if (!isRestValid || !isDateValid || !isTimeValid || !isGuestsValid || !isNameValid || !isEmailValid || !isPhoneValid) {
        const firstError = bookingForm.querySelector(".form-control.error");
        if (firstError) {
          firstError.focus();
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        if (typeof showToast === "function") {
          showToast("Please fill in all required fields accurately.", true);
        }
        return;
      }

      // Find restaurant name
      let restName = "Selected Restaurant";
      if (typeof StacklyData !== "undefined") {
        const found = StacklyData.getRestaurants().find(r => r.id === restaurantSelect.value);
        if (found) restName = found.name;
      }

      // Create demonstration reservation
      const newReservation = StacklyData.addReservation({
        restaurantId: restaurantSelect.value,
        restaurantName: restName,
        guestName: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        date: dateInput.value,
        time: timeSelect.value,
        guests: guestsSelect.value,
        occasion: occasionSelect.value || "Casual Dining",
        specialRequests: requestsInput ? requestsInput.value.trim() : ""
      });

      // Show Confirmation Modal
      showConfirmationModal(newReservation);

      // Reset form fields
      bookingForm.reset();
      dateInput.value = todayStr;
    });
  }

  // 7. Show Demonstration Confirmation Modal
  function showConfirmationModal(res) {
    let modal = document.getElementById("reservationSuccessModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "reservationSuccessModal";
      modal.className = "modal-backdrop";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-window" style="max-width: 520px; text-align: center; padding: 40px 32px;">
        <button class="modal-close-btn" aria-label="Close modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div style="width: 68px; height: 68px; border-radius: 50%; background-color: var(--color-sage); color: var(--color-green); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 style="font-size: 1.625rem; font-family: var(--font-display); margin-bottom: 8px;">Reservation Request Saved!</h3>
        <p style="font-size: 0.875rem; color: var(--color-muted); margin-bottom: 24px;">Your demonstration table reservation has been saved in local browser storage.</p>
        
        <!-- Demonstration Ticket Card -->
        <div style="background-color: var(--color-ivory); border: 1px dashed var(--color-border); border-radius: 16px; padding: 22px; text-align: left; margin-bottom: 24px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 12px; margin-bottom: 14px;">
            <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--color-green); letter-spacing: 0.08em;">DEMO RESERVATION TICKET</span>
            <span style="font-size: 0.8125rem; font-weight: 700; color: var(--color-charcoal);">${res.id}</span>
          </div>
          <h4 style="font-size: 1.1875rem; font-family: var(--font-display); color: var(--color-charcoal); margin-bottom: 8px;">${res.restaurantName}</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.8125rem; color: var(--color-muted);">
            <div><strong>Date:</strong> ${res.date}</div>
            <div><strong>Time:</strong> ${res.time}</div>
            <div><strong>Guests:</strong> ${res.guests}</div>
            <div><strong>Occasion:</strong> ${res.occasion}</div>
          </div>
        </div>

        <p style="font-size: 0.75rem; color: var(--color-muted); margin-bottom: 24px; line-height: 1.5;">
          <strong>Demonstration Note:</strong> This is a sample front-end simulation. No actual restaurant reservation has been made or transmitted to live venue systems.
        </p>

        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary modal-done-btn" style="flex: 1;">Close</button>
          <a href="ClientDashboard.html" class="btn btn-primary" style="flex: 1.4;">View in Dashboard →</a>
        </div>
      </div>
    `;

    modal.classList.add("show");

    modal.querySelector(".modal-close-btn").addEventListener("click", () => modal.classList.remove("show"));
    modal.querySelector(".modal-done-btn").addEventListener("click", () => modal.classList.remove("show"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });
  }
});
