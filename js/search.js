/**
 * Search Page Script
 * 
 * This script handles:
 * - Displaying logged in user info in header
 * - YouTube Data API integration for video search
 * - Displaying search results as cards
 * - Opening videos in modal player
 * - Adding videos to favorites/playlists
 * - Logout functionality
 */

// YouTube Data API Key - REPLACE WITH YOUR OWN API KEY
const YOUTUBE_API_KEY = 'AIzaSyDF10DVV1H_Hn2afX4ZD_i3frxfmDv4mHg';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

// Get DOM elements - will be initialized when DOM is ready
let userHeader = null;
let userImage = null;
let userGreeting = null;
let logoutBtn = null;
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsGrid = document.getElementById('resultsGrid');
const videoModalElement = document.getElementById('videoModal');
const closeModal = document.getElementById('closeModal');
const videoContainer = document.getElementById('videoContainer');
const favoritesModalElement = document.getElementById('favoritesModal');
const closeFavoritesModal = document.getElementById('closeFavoritesModal');
const closeFavoritesModalBtn = document.getElementById('closeFavoritesModalBtn');
const playlistSelect = document.getElementById('playlistSelect');
const newPlaylistName = document.getElementById('newPlaylistName');
const addToFavoritesBtn = document.getElementById('addToFavoritesBtn');
const toastElement = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Bootstrap Modal and Toast instances
let videoModal = null;
let favoritesModal = null;
let toast = null;

// Current video being added to favorites
let currentVideoToAdd = null;
let currentUser = null;
let lastSearchResults = []; // Store last search results
let lastSearchQuery = ''; // Store last search query

/**
 * Check if user is logged in
 * If not, redirect to login page
 */
function checkAuthentication() {
    currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * Initialize user header with current user info
 */
function initializeUserHeader() {
    // Get DOM elements if not already set
    if (!userImage) userImage = document.getElementById('userImage');
    if (!userGreeting) userGreeting = document.getElementById('userGreeting');
    
    if (currentUser && userImage && userGreeting) {
        userImage.src = currentUser.imageUrl;
        userImage.alt = currentUser.firstName;
        userGreeting.textContent = `Hello, ${currentUser.firstName}`;
    }
}

/**
 * Format duration from ISO 8601 format (PT4M13S) to readable format (4:13)
 * @param {string} duration - ISO 8601 duration string
 * @returns {string} Formatted duration
 */
function formatDuration(duration) {
    if (!duration) return 'N/A';
    
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 'N/A';
    
    const hours = (match[1] || '').replace('H', '') || '0';
    const minutes = (match[2] || '').replace('M', '') || '0';
    const seconds = (match[3] || '').replace('S', '') || '0';
    
    if (hours !== '0') {
        return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.padStart(2, '0')}`;
}

/**
 * Format view count (e.g., 1234567 -> "1.2M views")
 * @param {string} viewCount - View count as string
 * @returns {string} Formatted view count
 */
function formatViewCount(viewCount) {
    if (!viewCount) return '0 views';
    const count = parseInt(viewCount);
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
}

/**
 * Search YouTube videos using the API
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of video objects
 */
async function searchYouTube(query) {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
        alert('Please set your YouTube API key in search.js');
        return [];
    }
    
    try {
        const url = `${YOUTUBE_API_URL}?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            console.error('YouTube API Error:', data.error);
            return [];
        }
        
        // Get video details (duration, view count) for each video
        const videoIds = data.items.map(item => item.id.videoId).join(',');
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        // Combine search results with details
        return data.items.map((item, index) => {
            const details = detailsData.items[index];
            return {
                videoId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.medium.url,
                channelTitle: item.snippet.channelTitle,
                duration: details ? details.contentDetails.duration : '',
                viewCount: details ? details.statistics.viewCount : '0'
            };
        });
    } catch (error) {
        console.error('Error searching YouTube:', error);
        return [];
    }
}

/**
 * Check if video is already in user's playlists
 * @param {string} videoId - Video ID
 * @returns {boolean} True if video exists in any playlist
 */
function isVideoInFavorites(videoId) {
    return isVideoInPlaylists(currentUser.username, videoId);
}

/**
 * Display search results as cards
 * @param {Array} videos - Array of video objects
 * @param {string} query - Search query (optional, for saving)
 */
function displayResults(videos, query = '') {
    // Save results and query to sessionStorage
    lastSearchQuery = query || lastSearchQuery;
    lastSearchResults = videos;
    if (query) {
        sessionStorage.setItem('lastSearchQuery', query);
    }
    sessionStorage.setItem('lastSearchResults', JSON.stringify(videos));
    
    resultsGrid.innerHTML = ''; // Clear previous results
    
    if (videos.length === 0) {
        resultsGrid.innerHTML = '<div class="col-12"><p class="text-center text-muted">No results found. Try a different search term.</p></div>';
        return;
    }
    
    videos.forEach(video => {
        const isInFavorites = isVideoInFavorites(video.videoId);
        
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        const card = document.createElement('div');
        card.className = `card h-100 ${isInFavorites ? 'border-success border-2' : ''}`;
        
        card.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}" class="card-img-top" data-video-id="${video.videoId}" style="height: 200px; object-fit: cover; cursor: pointer;" title="Click to play">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title text-truncate" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; cursor: pointer;" title="${video.title}" data-video-id="${video.videoId}">${video.title}</h5>
                <div class="d-flex justify-content-between text-muted small mb-2">
                    <span>${formatDuration(video.duration)}</span>
                    <span>${formatViewCount(video.viewCount)}</span>
                </div>
                <div class="d-flex gap-2 mt-auto">
                    <button class="btn btn-success btn-sm play-btn" data-video-id="${video.videoId}">
                        <i class="fas fa-play"></i> Play
                    </button>
                    <button class="btn ${isInFavorites ? 'btn-secondary' : 'btn-primary'} btn-sm add-favorite-btn flex-grow-1" 
                            data-video-id="${video.videoId}" 
                            ${isInFavorites ? 'disabled' : ''}>
                        ${isInFavorites ? '<i class="fas fa-check-circle"></i> In Favorites' : '<i class="fas fa-heart"></i> Add to Favorites'}
                    </button>
                </div>
            </div>
        `;
        
        col.appendChild(card);
        resultsGrid.appendChild(col);
    });
    
    // Add event listeners to cards
    attachCardEventListeners();
    
    // Save results to sessionStorage for persistence
    lastSearchResults = videos;
    lastSearchQuery = query;
    sessionStorage.setItem('lastSearchResults', JSON.stringify(videos));
    sessionStorage.setItem('lastSearchQuery', query);
}

/**
 * Attach event listeners to video cards
 */
function attachCardEventListeners() {
    // Play button and thumbnail/title clicks
    document.querySelectorAll('.play-btn, .card-img-top[data-video-id], .card-title[data-video-id]').forEach(element => {
        element.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video-id');
            if (videoId) {
                openVideoPlayer(videoId);
            }
        });
    });
    
    // Add to favorites button
    document.querySelectorAll('.add-favorite-btn:not(:disabled)').forEach(button => {
        button.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video-id');
            if (videoId) {
                openAddToFavoritesModal(videoId);
            }
        });
    });
}

/**
 * Open video player modal
 * @param {string} videoId - YouTube video ID
 */
function openVideoPlayer(videoId) {
    videoContainer.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
        </iframe>
    `;
    if (!videoModal) {
        videoModal = new bootstrap.Modal(videoModalElement);
    }
    videoModal.show();
}

/**
 * Close video player modal
 */
function closeVideoPlayer() {
    if (videoModal) {
        videoModal.hide();
    }
    videoContainer.innerHTML = ''; // Clear iframe
}

/**
 * Load user playlists into dropdown
 */
function loadPlaylists() {
    const playlists = getUserPlaylists(currentUser.username);
    playlistSelect.innerHTML = '<option value="">-- Select Playlist --</option>';
    
    playlists.forEach(playlist => {
        const option = document.createElement('option');
        option.value = playlist.id;
        option.textContent = playlist.name;
        playlistSelect.appendChild(option);
    });
}

/**
 * Open add to favorites modal
 * @param {string} videoId - Video ID to add
 */
async function openAddToFavoritesModal(videoId) {
    // Get video details from current search results
    const videoCard = document.querySelector(`[data-video-id="${videoId}"]`).closest('.card');
    const title = videoCard.querySelector('.card-title').textContent;
    const thumbnail = videoCard.querySelector('.card-img-top').src;
    
    currentVideoToAdd = {
        videoId: videoId,
        title: title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: thumbnail,
        type: 'youtube',
        rating: 1 // Default rating
    };
    
    loadPlaylists();
    if (!favoritesModal) {
        favoritesModal = new bootstrap.Modal(favoritesModalElement);
    }
    favoritesModal.show();
}

/**
 * Close add to favorites modal
 */
function closeAddToFavoritesModal() {
    if (favoritesModal) {
        favoritesModal.hide();
    }
    currentVideoToAdd = null;
    newPlaylistName.value = '';
    newPlaylistName.style.display = 'none';
    document.querySelector('input[name="favoriteOption"][value="existing"]').checked = true;
    playlistSelect.disabled = false;
}

/**
 * Show toast notification with link to playlist
 * @param {string} playlistName - Name of the playlist
 * @param {string} playlistId - ID of the playlist
 */
/**
 * Show toast notification with link to playlist
 * @param {string} playlistName - Name of the playlist
 * @param {string} playlistId - ID of the playlist
 */
function showToastWithLink(playlistName, playlistId) {
    if (!toastElement || !toastMessage) return;
    
    // Create toast message with link
    toastMessage.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-check-circle text-success me-2"></i>
            <span>Video added to playlist <strong>"${playlistName}"</strong> successfully!</span>
        </div>
        <div class="mt-2">
            <a href="playlists.html?playlistId=${playlistId}" class="btn btn-sm btn-primary">
                <i class="fas fa-arrow-right me-1"></i>Go to Playlist
            </a>
        </div>
    `;
    
    // Initialize toast if not already initialized
    if (!toast) {
        toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 6000 // 6 seconds - enough time to read and click
        });
    }
    
    // Show toast
    toast.show();
}

/**
 * Save playlists to server API AND localStorage
 * This function ensures data is saved in both places for redundancy
 */
async function savePlaylistsToServer(playlists) {
    // ALWAYS save to localStorage first (for immediate availability)
    saveUserPlaylists(currentUser.username, playlists);
    
    // Then save to server
    try {
        const response = await fetch(`/api/playlists/${currentUser.username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(playlists)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save playlists to server');
        }
        
        console.log(`Successfully saved ${playlists.length} playlists to server and localStorage`);
        return true;
    } catch (error) {
        console.error('Error saving playlists to server:', error);
        console.log('Data saved to localStorage only (server unavailable)');
        // Data is already saved to localStorage above, so we return false but data is still available
        return false;
    }
}

/**
 * Handle add to favorites form submission
 */
async function handleAddToFavorites() {
    if (!currentVideoToAdd) return;
    
    const selectedOption = document.querySelector('input[name="favoriteOption"]:checked').value;
    
    let playlistId;
    let playlistName;
    let playlists;
    
    if (selectedOption === 'existing') {
        playlistId = playlistSelect.value;
        if (!playlistId) {
            alert('Please select a playlist');
            return;
        }
        playlists = getUserPlaylists(currentUser.username);
        const playlist = playlists.find(p => p.id === playlistId);
        playlistName = playlist ? playlist.name : '';
    } else {
        playlistName = newPlaylistName.value.trim();
        if (!playlistName) {
            alert('Please enter a playlist name');
            return;
        }
        // Create playlist locally first
        const newPlaylist = createPlaylist(currentUser.username, playlistName);
        playlistId = newPlaylist.id;
        playlists = getUserPlaylists(currentUser.username);
    }
    
    // Add video to playlist
    const added = addVideoToPlaylist(currentUser.username, playlistId, currentVideoToAdd);
    
    if (added) {
        // Get updated playlists
        playlists = getUserPlaylists(currentUser.username);
        
        console.log('Saving playlists to server:', playlists);
        
        // Save to server
        const saved = await savePlaylistsToServer(playlists);
        
        if (!saved) {
            console.error('Failed to save playlists to server - using localStorage only');
            // Data is already saved to localStorage, continue silently
        }
        
        closeAddToFavoritesModal();
        
        // Refresh search results to update "In Favorites" status
        if (lastSearchResults.length > 0) {
            displayResults(lastSearchResults, lastSearchQuery);
        }
        
        // Show toast notification with link to playlist (instead of redirect)
        showToastWithLink(playlistName, playlistId);
    } else {
        alert('Video is already in this playlist');
    }
}

// Event Listeners

/**
 * Update URL with search query
 * @param {string} query - Search query
 */
function updateURL(query) {
    const url = new URL(window.location);
    if (query) {
        url.searchParams.set('q', query);
    } else {
        url.searchParams.delete('q');
    }
    window.history.pushState({}, '', url);
}

/**
 * Load search results from URL or sessionStorage
 */
function loadSearchFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const queryFromURL = urlParams.get('q');
    
    if (queryFromURL) {
        // Load query from URL
        searchInput.value = queryFromURL;
        // Try to load results from sessionStorage first
        const savedResults = sessionStorage.getItem('lastSearchResults');
        const savedQuery = sessionStorage.getItem('lastSearchQuery');
        
        if (savedResults && savedQuery === queryFromURL) {
            // Load saved results
            try {
                const videos = JSON.parse(savedResults);
                displayResults(videos, queryFromURL);
                return; // Don't perform new search if we loaded saved results
            } catch (e) {
                console.error('Error parsing saved results:', e);
            }
        }
        // Perform new search if no saved results or query mismatch
        searchBtn.click();
    } else {
        // No query in URL - check if there are saved results from previous session
        const savedResults = sessionStorage.getItem('lastSearchResults');
        const savedQuery = sessionStorage.getItem('lastSearchQuery');
        
        if (savedResults && savedQuery) {
            searchInput.value = savedQuery;
            try {
                const videos = JSON.parse(savedResults);
                displayResults(videos, savedQuery);
                // Update URL without triggering search
                updateURL(savedQuery);
            } catch (e) {
                console.error('Error parsing saved results:', e);
            }
        }
    }
}

// Search functionality
searchBtn.addEventListener('click', async function() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a search term');
        return;
    }
    
    // Update URL with query
    updateURL(query);
    
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Searching...';
    
    const videos = await searchYouTube(query);
    displayResults(videos, query);
    
    searchBtn.disabled = false;
    searchBtn.innerHTML = '<i class="fas fa-search me-1"></i>Search';
});

// Enter key in search input
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Modal close buttons
closeModal.addEventListener('click', closeVideoPlayer);
closeFavoritesModal.addEventListener('click', closeAddToFavoritesModal);
if (closeFavoritesModalBtn) {
    closeFavoritesModalBtn.addEventListener('click', closeAddToFavoritesModal);
}

// Clear video container when modal is hidden
videoModalElement.addEventListener('hidden.bs.modal', function() {
    videoContainer.innerHTML = '';
});

// Favorite option radio buttons
document.querySelectorAll('input[name="favoriteOption"]').forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'new') {
            newPlaylistName.style.display = 'block';
            playlistSelect.disabled = true;
        } else {
            newPlaylistName.style.display = 'none';
            playlistSelect.disabled = false;
        }
    });
});

// Add to favorites button
addToFavoritesBtn.addEventListener('click', handleAddToFavorites);

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    if (!userImage) userImage = document.getElementById('userImage');
    if (!userGreeting) userGreeting = document.getElementById('userGreeting');
    if (!logoutBtn) logoutBtn = document.getElementById('logoutBtn');
    
    if (checkAuthentication()) {
        initializeUserHeader();
        
        // Load search from URL or sessionStorage
        loadSearchFromURL();
        
        // Logout functionality
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to logout?')) {
                    clearCurrentUser();
                    // Clear search results on logout
                    sessionStorage.removeItem('lastSearchQuery');
                    sessionStorage.removeItem('lastSearchResults');
                    window.location.href = 'login.html';
                }
            });
        }
    }
});

