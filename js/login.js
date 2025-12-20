/**
 * Login Page Script
 * 
 * This script handles the login functionality:
 * - Validates username and password against localStorage
 * - Saves current user to sessionStorage
 * - Redirects to search page on successful login
 * - Prevents access if user is already logged in
 */

// Get form and input elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');

/**
 * Check if user is already logged in
 * If yes, redirect to search page
 */
function checkExistingSession() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        // User is already logged in, redirect to search page
        window.location.href = 'search.html';
    }
}

/**
 * Show error message
 * @param {HTMLElement} errorElement - Error message element
 * @param {string} message - Error message to display
 */
function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

/**
 * Hide error message
 * @param {HTMLElement} errorElement - Error message element
 */
function hideError(errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
}

/**
 * Handle form submission
 * @param {Event} e - Form submit event
 */
loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent default form submission
    
    // Reset errors
    hideError(usernameError);
    hideError(passwordError);
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    // Validate inputs
    if (!username) {
        showError(usernameError, 'Username is required');
        return;
    }
    
    if (!password) {
        showError(passwordError, 'Password is required');
        return;
    }
    
    // Authenticate user from localStorage
    const user = verifyUser(username, password);
    if (user) {
        // Ensure username is included
        if (!user.username) {
            user.username = username;
        }
        // Save to sessionStorage and redirect
        setCurrentUser(user);
        window.location.href = 'search.html';
    } else {
        showError(passwordError, 'Invalid username or password');
    }
});

// Check for existing session when page loads
checkExistingSession();

