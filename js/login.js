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
loginForm.addEventListener('submit', async function(e) {
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
    
    try {
        // Login via API
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.user) {
            const user = data.user;
            // Ensure username is included
            if (!user.username) {
                user.username = username;
            }
            // Debug: Log user before saving
            console.log('Logging in user:', user);
            // Success - save to sessionStorage and redirect
            setCurrentUser(user);
            // Also save to localStorage for fallback
            const localUser = verifyUser(username, password);
            if (localUser) {
                // User exists in localStorage, good
            }
            // Verify it was saved correctly
            const savedUser = getCurrentUser();
            console.log('User saved to sessionStorage:', savedUser);
            window.location.href = 'search.html';
        } else {
            // Invalid credentials
            showError(passwordError, data.error || 'Invalid username or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        // Fallback to localStorage
        const user = verifyUser(username, password);
        if (user) {
            if (!user.username) {
                user.username = username;
            }
            setCurrentUser(user);
            window.location.href = 'search.html';
        } else {
            showError(passwordError, 'Invalid username or password');
        }
    }
});

// Check for existing session when page loads
checkExistingSession();

