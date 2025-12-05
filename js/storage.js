/**
 * Storage Utility Module
 * 
 * This module handles all localStorage and sessionStorage operations.
 * It provides functions to manage users, playlists, and current user session.
 * 
 * Storage Structure:
 * - localStorage.users: Array of all registered users
 * - localStorage.playlists: Object with user playlists (key: username, value: array of playlists)
 * - sessionStorage.currentUser: Currently logged in user object
 */

// Storage keys constants
const STORAGE_KEYS = {
    USERS: 'users',
    PLAYLISTS: 'playlists',
    CURRENT_USER: 'currentUser'
};

/**
 * Initialize storage if it doesn't exist
 * Creates empty arrays/objects for users and playlists
 */
function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PLAYLISTS)) {
        localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify({}));
    }
}

/**
 * Get all users from localStorage
 * @returns {Array} Array of user objects
 */
function getUsers() {
    initializeStorage();
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
}

/**
 * Save a new user to localStorage
 * @param {Object} user - User object with username, password, firstName, imageUrl
 * @returns {boolean} True if user was saved successfully, false if username already exists
 */
function saveUser(user) {
    const users = getUsers();
    
    // Check if username already exists
    if (users.some(u => u.username === user.username)) {
        return false;
    }
    
    // Add new user (don't store password in plain text in production!)
    users.push({
        username: user.username,
        password: user.password, // In production, this should be hashed
        firstName: user.firstName,
        imageUrl: user.imageUrl
    });
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return true;
}

/**
 * Find a user by username
 * @param {string} username - Username to search for
 * @returns {Object|null} User object if found, null otherwise
 */
function findUser(username) {
    const users = getUsers();
    return users.find(u => u.username === username) || null;
}

/**
 * Verify user credentials
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object|null} User object if credentials are valid, null otherwise
 */
function verifyUser(username, password) {
    const user = findUser(username);
    if (user && user.password === password) {
        // Return user without password, but ensure username is included
        const { password, ...userWithoutPassword } = user;
        // Explicitly ensure username is included
        userWithoutPassword.username = user.username;
        return userWithoutPassword;
    }
    return null;
}

/**
 * Get current logged in user from sessionStorage
 * @returns {Object|null} Current user object or null if not logged in
 */
function getCurrentUser() {
    const currentUser = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return currentUser ? JSON.parse(currentUser) : null;
}

/**
 * Set current logged in user in sessionStorage
 * @param {Object} user - User object to set as current user
 */
function setCurrentUser(user) {
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

/**
 * Clear current user from sessionStorage (logout)
 */
function clearCurrentUser() {
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

/**
 * Get all playlists for a specific user
 * @param {string} username - Username
 * @returns {Array} Array of playlist objects
 */
function getUserPlaylists(username) {
    initializeStorage();
    const playlists = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    const playlistsObj = playlists ? JSON.parse(playlists) : {};
    return playlistsObj[username] || [];
}

/**
 * Save playlists for a specific user
 * @param {string} username - Username
 * @param {Array} playlistsArray - Array of playlist objects
 */
function saveUserPlaylists(username, playlistsArray) {
    initializeStorage();
    const playlists = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    const playlistsObj = playlists ? JSON.parse(playlists) : {};
    playlistsObj[username] = playlistsArray;
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlistsObj));
}

/**
 * Add a video to a playlist
 * @param {string} username - Username
 * @param {string} playlistId - Playlist ID
 * @param {Object} video - Video object to add
 * @returns {boolean} True if video was added, false if it already exists
 */
function addVideoToPlaylist(username, playlistId, video) {
    const playlists = getUserPlaylists(username);
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) {
        return false;
    }
    
    // Check if video already exists in playlist
    if (playlist.videos.some(v => v.videoId === video.videoId)) {
        return false;
    }
    
    playlist.videos.push(video);
    saveUserPlaylists(username, playlists);
    return true;
}

/**
 * Check if a video exists in any of user's playlists
 * @param {string} username - Username
 * @param {string} videoId - Video ID to check
 * @returns {boolean} True if video exists in any playlist
 */
function isVideoInPlaylists(username, videoId) {
    const playlists = getUserPlaylists(username);
    return playlists.some(playlist => 
        playlist.videos.some(video => video.videoId === videoId)
    );
}

/**
 * Create a new playlist for a user
 * @param {string} username - Username
 * @param {string} playlistName - Name of the new playlist
 * @returns {Object} The newly created playlist object
 */
function createPlaylist(username, playlistName) {
    const playlists = getUserPlaylists(username);
    const newPlaylist = {
        id: Date.now().toString(), // Simple ID generation
        name: playlistName,
        videos: []
    };
    playlists.push(newPlaylist);
    saveUserPlaylists(username, playlists);
    return newPlaylist;
}

// Initialize storage when module loads
initializeStorage();

