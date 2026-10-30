/**
 * STACKLY — RESTAURANT TABLE BOOKING PLATFORM
 * Reusable Form Validation Helper (js/validation.js)
 */

const Validation = (() => {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

  const setFieldError = (input, message) => {
    input.classList.add("error");
    const parent = input.closest(".form-group") || input.parentElement;
    if (parent) parent.classList.add("has-error");
    let errElem = parent.querySelector(".error-message");
    if (!errElem) {
      errElem = document.createElement("span");
      errElem.className = "error-message";
      parent.appendChild(errElem);
    }
    errElem.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;
    errElem.classList.add("visible");
  };

  const clearFieldError = (input) => {
    input.classList.remove("error");
    const parent = input.closest(".form-group") || input.parentElement;
    if (parent) parent.classList.remove("has-error");
    const errElem = parent.querySelector(".error-message");
    if (errElem) {
      errElem.innerHTML = "";
      errElem.classList.remove("visible");
    }
  };

  return {
    validateRequired: (input, fieldName = "This field") => {
      const val = input.value.trim();
      if (!val) {
        setFieldError(input, `${fieldName} is required.`);
        return false;
      }
      clearFieldError(input);
      return true;
    },

    validateEmail: (input) => {
      const val = input.value.trim();
      if (!val) {
        setFieldError(input, "Email address or User ID is required.");
        return false;
      }
      const isEmail = EMAIL_REGEX.test(val);
      const isUserId = /^[a-zA-Z0-9._\-+]{2,}$/.test(val);
      if (!isEmail && !isUserId) {
        setFieldError(input, "Please enter a valid email address or user ID.");
        return false;
      }
      clearFieldError(input);
      return true;
    },

    validatePhone: (input) => {
      const val = input.value.trim();
      if (!val) {
        setFieldError(input, "Phone number is required.");
        return false;
      }
      const digits = val.replace(/\D/g, "");
      if (digits.length < 10) {
        setFieldError(input, "Please enter a valid phone number (at least 10 digits).");
        return false;
      }
      clearFieldError(input);
      return true;
    },

    validateDateNotPast: (input) => {
      const val = input.value;
      if (!val) {
        setFieldError(input, "Dining date is required.");
        return false;
      }
      const selected = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selected < today) {
        setFieldError(input, "Dining date cannot be in the past.");
        return false;
      }
      clearFieldError(input);
      return true;
    },

    validatePasswordLength: (input, minLength = 6) => {
      const val = input.value;
      if (!val) {
        setFieldError(input, "Password is required.");
        return false;
      }
      if (val.length < minLength) {
        setFieldError(input, `Password must be at least ${minLength} characters.`);
        return false;
      }
      clearFieldError(input);
      return true;
    },

    validateMatch: (input1, input2, message = "Passwords do not match.") => {
      if (input1.value !== input2.value) {
        setFieldError(input2, message);
        return false;
      }
      clearFieldError(input2);
      return true;
    },

    validateCheckbox: (input, message = "You must agree to continue.") => {
      if (!input.checked) {
        setFieldError(input, message);
        return false;
      }
      clearFieldError(input);
      return true;
    },

    clearError: clearFieldError
  };
})();
