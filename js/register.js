/**
 * Registration Page Script
 * 
 * This script handles the registration form functionality:
 * - Form validation (required fields, password strength, username uniqueness)
 * - Saving new users to localStorage
 * - Redirecting to login page on success
 */

// Get form and input elements
const registerForm = document.getElementById('registerForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const firstNameInput = document.getElementById('firstName');
const imageUrlInput = document.getElementById('imageUrl');

// Error message elements
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const firstNameError = document.getElementById('firstNameError');
const imageUrlError = document.getElementById('imageUrlError');

/**
 * Validate password strength
 * Requirements:
 * - At least one letter
 * - At least one number
 * - At least one non-alphanumeric character
 * - Minimum 6 characters
 * 
 * @param {string} password - Password to validate
 * @returns {Object} {valid: boolean, message: string}
 */
function validatePassword(password) {
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters long' };
    }
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasNonAlphanumeric = /[^a-zA-Z0-9]/.test(password);
    
    if (!hasLetter) {
        return { valid: false, message: 'Password must contain at least one letter' };
    }
    
    if (!hasNumber) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    
    if (!hasNonAlphanumeric) {
        return { valid: false, message: 'Password must contain at least one non-alphanumeric character' };
    }
    
    return { valid: true, message: '' };
}

/**
 * Show error message for a field
 * @param {HTMLElement} errorElement - Error message element
 * @param {string} message - Error message to display
 */
function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

/**
 * Hide error message for a field
 * @param {HTMLElement} errorElement - Error message element
 */
function hideError(errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
}

/**
 * Validate all form fields
 * @returns {boolean} True if all validations pass
 */
function validateForm() {
    let isValid = true;
    
    // Reset all errors
    hideError(usernameError);
    hideError(passwordError);
    hideError(confirmPasswordError);
    hideError(firstNameError);
    hideError(imageUrlError);
    
    // Validate username
    if (!usernameInput.value.trim()) {
        showError(usernameError, 'Username is required');
        isValid = false;
    } else {
        // Check if username already exists
        const existingUser = findUser(usernameInput.value.trim());
        if (existingUser) {
            showError(usernameError, 'Username already exists');
            isValid = false;
        }
    }
    
    // Validate password
    if (!passwordInput.value) {
        showError(passwordError, 'Password is required');
        isValid = false;
    } else {
        const passwordValidation = validatePassword(passwordInput.value);
        if (!passwordValidation.valid) {
            showError(passwordError, passwordValidation.message);
            isValid = false;
        }
    }
    
    // Validate password confirmation
    if (!confirmPasswordInput.value) {
        showError(confirmPasswordError, 'Please confirm your password');
        isValid = false;
    } else if (passwordInput.value !== confirmPasswordInput.value) {
        showError(confirmPasswordError, 'Passwords do not match');
        isValid = false;
    }
    
    // Validate first name
    if (!firstNameInput.value.trim()) {
        showError(firstNameError, 'First name is required');
        isValid = false;
    }
    
    // Validate image URL
    if (!imageUrlInput.value.trim()) {
        showError(imageUrlError, 'Image URL is required');
        isValid = false;
    } else {
        // Basic URL validation
        try {
            new URL(imageUrlInput.value.trim());
        } catch (e) {
            showError(imageUrlError, 'Please enter a valid URL');
            isValid = false;
        }
    }
    
    return isValid;
}

/**
 * Handle form submission
 * @param {Event} e - Form submit event
 */
registerForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent default form submission
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Create user object
    const newUser = {
        username: usernameInput.value.trim(),
        password: passwordInput.value, // In production, hash this!
        firstName: firstNameInput.value.trim(),
        imageUrl: imageUrlInput.value.trim()
    };
    
    // Save user to localStorage
    const saved = saveUser(newUser);
    
    if (saved) {
        // Success - redirect to login page
        alert('Registration successful! Redirecting to login...');
        window.location.href = 'login.html';
    } else {
        // Username already exists (shouldn't happen if validation worked, but just in case)
        showError(usernameError, 'Username already exists');
    }
});

// Real-time validation on input blur
usernameInput.addEventListener('blur', function() {
    if (usernameInput.value.trim()) {
        const existingUser = findUser(usernameInput.value.trim());
        if (existingUser) {
            showError(usernameError, 'Username already exists');
        } else {
            hideError(usernameError);
        }
    }
});

passwordInput.addEventListener('blur', function() {
    if (passwordInput.value) {
        const passwordValidation = validatePassword(passwordInput.value);
        if (!passwordValidation.valid) {
            showError(passwordError, passwordValidation.message);
        } else {
            hideError(passwordError);
        }
    }
});

confirmPasswordInput.addEventListener('blur', function() {
    if (confirmPasswordInput.value) {
        if (passwordInput.value !== confirmPasswordInput.value) {
            showError(confirmPasswordError, 'Passwords do not match');
        } else {
            hideError(confirmPasswordError);
        }
    }
});

