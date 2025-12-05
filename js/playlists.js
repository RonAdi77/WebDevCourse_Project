/**
 * Playlists Page Script
 * 
 * This script handles:
 * - Displaying logged in user info in header
 * - Loading and displaying user playlists
 * - Creating new playlists
 * - Displaying playlist content
 * - Searching within playlist
 * - Sorting playlist (A-Z or by rating)
 * - Rating videos
 * - Deleting videos and playlists
 * - Playing playlists
 * - Toast notifications
 */

// YouTube Data API Key - Same as search.js
const YOUTUBE_API_KEY = 'AIzaSyDF10DVV1H_Hn2afX4ZD_i3frxfmDv4mHg';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

// Get DOM elements
const userHeader = document.getElementById('userHeader');
const userImage = document.getElementById('userImage');
const userGreeting = document.getElementById('userGreeting');
const logoutBtn = document.getElementById('logoutBtn');
const newPlaylistBtn = document.getElementById('newPlaylistBtn');
const playlistList = document.getElementById('playlistList');
const playPlaylistBtn = document.getElementById('playPlaylistBtn');
const playlistTitle = document.getElementById('playlistTitle');
const searchPlaylistInput = document.getElementById('searchPlaylistInput');
const sortBtn = document.getElementById('sortBtn');
const playlistSongs = document.getElementById('playlistSongs');
const playlistControls = document.getElementById('playlistControls');
const youtubeSearchCard = document.getElementById('youtubeSearchCard');
const youtubeSearchInput = document.getElementById('youtubeSearchInput');
const youtubeSearchBtn = document.getElementById('youtubeSearchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const youtubeSearchResults = document.getElementById('youtubeSearchResults');
const viewToggleBtn = document.getElementById('viewToggleBtn');
const viewToggleIcon = document.getElementById('viewToggleIcon');
const tableView = document.getElementById('tableView');
const playlistTable = document.getElementById('playlistTable');
const playlistTableBody = document.getElementById('playlistTableBody');
const cardsView = document.getElementById('cardsView');
const playlistCards = document.getElementById('playlistCards');
const newPlaylistModalElement = document.getElementById('newPlaylistModal');
const closeNewPlaylistModal = document.getElementById('closeNewPlaylistModal');
const closeNewPlaylistModalBtn = document.getElementById('closeNewPlaylistModalBtn');
const newPlaylistNameInput = document.getElementById('newPlaylistNameInput');
const createPlaylistBtn = document.getElementById('createPlaylistBtn');
const toastElement = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const toastLink = document.getElementById('toastLink');

// Bootstrap Modal and Toast instances
let newPlaylistModal = null;
let toast = null;

// Current state
let currentUser = null;
let currentPlaylistId = null;
let currentPlaylist = null;
let sortOrder = 'name'; // 'name' or 'rating'
let allVideos = []; // Store all videos for filtering
let viewMode = 'table'; // 'table' or 'cards'

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
    // Debug: Log current user to verify it's correct
    console.log('Current user loaded:', currentUser);
    if (!currentUser.username) {
        console.error('ERROR: Current user missing username!', currentUser);
        // Clear invalid session and redirect to login
        clearCurrentUser();
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * Initialize user header with current user info
 */
function initializeUserHeader() {
    if (currentUser) {
        userImage.src = currentUser.imageUrl;
        userImage.alt = currentUser.firstName;
        userGreeting.textContent = `Hello, ${currentUser.firstName}`;
    }
}

/**
 * Load playlists from localStorage and display them
 */
function loadPlaylists() {
    if (!currentUser || !currentUser.username) {
        console.error('ERROR: Cannot load playlists - no current user or username');
        return;
    }
    console.log('Loading playlists for user:', currentUser.username);
    const playlists = getUserPlaylists(currentUser.username);
    console.log('Found playlists:', playlists);
    playlistList.innerHTML = '';
    
    if (playlists.length === 0) {
        playlistList.innerHTML = '<li style="padding: 20px; text-align: center; color: #999;">No playlists yet. Create one!</li>';
        return;
    }
    
    playlists.forEach(playlist => {
        const li = document.createElement('li');
        li.className = 'list-group-item playlist-item';
        li.textContent = playlist.name;
        li.setAttribute('data-playlist-id', playlist.id);
        li.addEventListener('click', function() {
            selectPlaylist(playlist.id);
        });
        playlistList.appendChild(li);
    });
    
    // Check for playlist ID in URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const playlistIdFromUrl = urlParams.get('playlistId');
    
    if (playlistIdFromUrl) {
        selectPlaylist(playlistIdFromUrl);
    } else if (playlists.length > 0) {
        // Select first playlist by default
        selectPlaylist(playlists[0].id);
    }
}

/**
 * Extract YouTube video ID from URL
 * Supports various YouTube URL formats
 */
function extractYouTubeId(url) {
    if (!url) return null;
    
    // Pattern for standard YouTube URLs: youtube.com/watch?v=VIDEO_ID
    let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (match && match[1]) {
        return match[1];
    }
    return null;
}

/**
 * Get YouTube thumbnail URL from video ID
 */
function getYouTubeThumbnail(videoId) {
    if (!videoId) return '';
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

/**
 * Get YouTube embed URL for playing video
 */
function getYouTubeEmbedUrl(videoId) {
    if (!videoId) return '';
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

/**
 * Play video in popup window
 * Made global so it can be called from onclick handlers
 */
window.playVideo = function(videoId) {
    if (!videoId) return;
    const embedUrl = getYouTubeEmbedUrl(videoId);
    const width = 800;
    const height = 600;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    window.open(
        embedUrl,
        'YouTube Player',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
};

/**
 * Select a playlist and display its content
 * @param {string} playlistId - Playlist ID to select
 */
function selectPlaylist(playlistId) {
    currentPlaylistId = playlistId;
    
    // Update active state in sidebar
    document.querySelectorAll('.playlist-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-playlist-id') === playlistId) {
            item.classList.add('active');
        }
    });
    
    // Get playlist data
    const playlists = getUserPlaylists(currentUser.username);
    currentPlaylist = playlists.find(p => p.id === playlistId);
    
    if (!currentPlaylist) {
        playlistTitle.textContent = 'Playlist not found';
        playlistSongs.innerHTML = '<p class="text-muted text-center py-5">Playlist not found</p>';
        playPlaylistBtn.disabled = true;
        if (youtubeSearchCard) youtubeSearchCard.style.display = 'none';
        if (playlistControls) playlistControls.style.display = 'none';
        if (viewToggleBtn) viewToggleBtn.style.display = 'none';
        return;
    }
    
    // Update playlist title
    playlistTitle.textContent = currentPlaylist.name;
    
    // Enable play button
    playPlaylistBtn.disabled = false;
    
    // Show YouTube search and controls
    if (youtubeSearchCard) youtubeSearchCard.style.display = 'block';
    if (playlistControls) playlistControls.style.display = 'flex';
    if (viewToggleBtn) viewToggleBtn.style.display = 'block';
    
    // Display playlist videos
    displayPlaylistVideos(currentPlaylist.videos);
}

/**
 * Format duration from ISO 8601 format to readable format
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
 * Format view count
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
 * Display videos in the playlist
 * @param {Array} videos - Array of video objects
 */
function displayPlaylistVideos(videos) {
    allVideos = videos; // Store for filtering
    
    if (videos.length === 0) {
        playlistSongs.innerHTML = '<p class="text-muted text-center py-5">This playlist is empty. Add your first song!</p>';
        playlistTable.style.display = 'none';
        cardsView.style.display = 'none';
        return;
    }
    
    // Sort videos
    const sortedVideos = sortVideos([...videos]);
    
    // Clear previous content
    playlistTableBody.innerHTML = '';
    playlistCards.innerHTML = '';
    playlistSongs.innerHTML = '';
    
    // Display based on view mode
    if (viewMode === 'table') {
        renderTableView(sortedVideos);
    } else {
        renderCardsView(sortedVideos);
    }
    
    // Attach event listeners
    attachVideoEventListeners();
}

/**
 * Render videos in table view
 */
function renderTableView(videos) {
    playlistTable.style.display = 'table';
    cardsView.style.display = 'none';
    
    videos.forEach(video => {
        const videoId = video.videoId || extractYouTubeId(video.url || '');
        const thumbnail = video.thumbnail || getYouTubeThumbnail(videoId);
        const rating = video.rating || 1;
        
        const row = document.createElement('tr');
        row.setAttribute('data-video-id', videoId);
        
        row.innerHTML = `
            <td>
                ${thumbnail ? `
                    <img src="${thumbnail}" 
                         alt="${video.title}" 
                         style="width: 120px; height: 90px; object-fit: cover; cursor: pointer;" 
                         onclick="playVideo('${videoId}')" 
                         title="Click to play">
                ` : '<i class="fas fa-music fa-2x text-muted"></i>'}
            </td>
            <td>${video.title}</td>
            <td>
                <input type="number" 
                       min="1" 
                       max="10" 
                       value="${rating}" 
                       data-video-id="${videoId}"
                       class="form-control form-control-sm rating-input" 
                       style="width: 70px; display: inline-block;">
            </td>
            <td class="text-end">
                <button class="btn btn-success btn-sm me-2" onclick="playVideo('${videoId}')" title="Play video">
                    <i class="fas fa-play"></i>
                </button>
                <button class="btn btn-danger btn-sm delete-btn" data-video-id="${videoId}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        playlistTableBody.appendChild(row);
    });
}

/**
 * Render videos in cards view
 */
function renderCardsView(videos) {
    playlistTable.style.display = 'none';
    cardsView.style.display = 'block';
    
    videos.forEach(video => {
        const videoId = video.videoId || extractYouTubeId(video.url || '');
        const thumbnail = video.thumbnail || getYouTubeThumbnail(videoId);
        const rating = video.rating || 1;
        
        const col = document.createElement('div');
        col.className = 'col-md-4';
        col.setAttribute('data-video-id', videoId);
        
        col.innerHTML = `
            <div class="card h-100">
                ${thumbnail ? `
                    <img src="${thumbnail}" 
                         class="card-img-top" 
                         alt="${video.title}" 
                         style="height: 200px; object-fit: cover; cursor: pointer;" 
                         onclick="playVideo('${videoId}')" 
                         title="Click to play">
                ` : '<div class="card-img-top bg-secondary d-flex align-items-center justify-content-center" style="height: 200px;"><i class="fas fa-music fa-3x text-muted"></i></div>'}
                <div class="card-body">
                    <h6 class="card-title">${video.title}</h6>
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <label class="mb-0 small">Rating:</label>
                        <input type="number" 
                               min="1" 
                               max="10" 
                               value="${rating}" 
                               data-video-id="${videoId}"
                               class="form-control form-control-sm rating-input" 
                               style="width: 70px;">
                    </div>
                </div>
                <div class="card-footer">
                    <div class="d-flex gap-2">
                        <button class="btn btn-success btn-sm flex-grow-1" onclick="playVideo('${videoId}')" title="Play video">
                            <i class="fas fa-play me-1"></i>Play
                        </button>
                        <button class="btn btn-danger btn-sm delete-btn" data-video-id="${videoId}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        playlistCards.appendChild(col);
    });
}

/**
 * Sort videos based on current sort order
 * @param {Array} videos - Array of videos to sort
 * @returns {Array} Sorted array
 */
function sortVideos(videos) {
    if (sortOrder === 'name') {
        return videos.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === 'rating') {
        return videos.sort((a, b) => (b.rating || 1) - (a.rating || 1));
    }
    return videos;
}

/**
 * Attach event listeners to video items
 */
function attachVideoEventListeners() {
    // Rating inputs
    document.querySelectorAll('.rating-input').forEach(input => {
        input.addEventListener('change', function() {
            const videoId = this.getAttribute('data-video-id');
            const rating = parseInt(this.value) || 1;
            // Ensure rating is between 1 and 10
            const validRating = Math.max(1, Math.min(10, rating));
            if (validRating !== rating) {
                this.value = validRating;
            }
            updateVideoRating(videoId, validRating);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video-id');
            if (confirm('Are you sure you want to delete this video from the playlist?')) {
                deleteVideoFromPlaylist(videoId);
            }
        });
    });
}

/**
 * Update video rating
 * @param {string} videoId - Video ID
 * @param {number} rating - Rating value (1-10)
 */
function updateVideoRating(videoId, rating) {
    if (!currentUser || !currentUser.username) {
        console.error('Cannot update rating - no current user');
        return;
    }
    
    const playlists = getUserPlaylists(currentUser.username);
    const playlist = playlists.find(p => p.id === currentPlaylistId);
    
    if (playlist) {
        const video = playlist.videos.find(v => v.videoId === videoId);
        if (video) {
            // Ensure rating is between 1 and 10
            video.rating = Math.max(1, Math.min(10, rating));
            saveUserPlaylists(currentUser.username, playlists);
            
            // Update currentPlaylist to reflect changes
            currentPlaylist = playlist;
            
            // Refresh display if sorting by rating
            if (sortOrder === 'rating') {
                displayPlaylistVideos(playlist.videos);
            }
        }
    }
}

/**
 * Delete video from playlist
 * @param {string} videoId - Video ID to delete
 */
function deleteVideoFromPlaylist(videoId) {
    const playlists = getUserPlaylists(currentUser.username);
    const playlist = playlists.find(p => p.id === currentPlaylistId);
    
    if (playlist) {
        playlist.videos = playlist.videos.filter(v => v.videoId !== videoId);
        saveUserPlaylists(currentUser.username, playlists);
        displayPlaylistVideos(playlist.videos);
    }
}

/**
 * Delete entire playlist
 * @param {string} playlistId - Playlist ID to delete
 */
function deletePlaylist(playlistId) {
    if (confirm('Are you sure you want to delete this entire playlist?')) {
        const playlists = getUserPlaylists(currentUser.username);
        const filteredPlaylists = playlists.filter(p => p.id !== playlistId);
        saveUserPlaylists(currentUser.username, filteredPlaylists);
        
        // Reload playlists
        loadPlaylists();
        
        // Clear current playlist if it was deleted
        if (currentPlaylistId === playlistId) {
            currentPlaylistId = null;
            currentPlaylist = null;
            playlistTitle.textContent = 'Select a playlist from the list';
            playlistSongs.innerHTML = '<p class="text-muted text-center py-5">Select a playlist from the list to view its content</p>';
            playPlaylistBtn.disabled = true;
        }
    }
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} linkUrl - Optional link URL
 * @param {string} linkText - Optional link text
 */
function showToast(message, linkUrl = null, linkText = null) {
    toastMessage.textContent = message;
    
    if (linkUrl && linkText) {
        toastLink.href = linkUrl;
        toastLink.textContent = linkText;
        toastLink.style.display = 'block';
    } else {
        toastLink.style.display = 'none';
    }
    
    if (!toast) {
        toast = new bootstrap.Toast(toastElement);
    }
    toast.show();
}

/**
 * Handle search within playlist
 */
function handlePlaylistSearch() {
    const query = searchPlaylistInput.value.toLowerCase().trim();
    
    if (!query) {
        displayPlaylistVideos(allVideos);
        return;
    }
    
    const filteredVideos = allVideos.filter(video => 
        video.title.toLowerCase().includes(query)
    );
    
    if (filteredVideos.length === 0) {
        playlistSongs.innerHTML = '<p class="text-muted text-center py-5">No videos found matching your search</p>';
    } else {
        // Use the same display function but with filtered videos
        displayPlaylistVideos(filteredVideos);
    }
}

/**
 * Search YouTube videos using the API
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of video objects
 */
async function searchYouTube(query) {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
        alert('Please set your YouTube API key');
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
 * Clear YouTube search results
 */
function clearYouTubeSearch() {
    youtubeSearchInput.value = '';
    youtubeSearchResults.innerHTML = '';
    if (clearSearchBtn) {
        clearSearchBtn.style.display = 'none';
    }
    // Scroll back to top of search section
    if (youtubeSearchCard) {
        youtubeSearchCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Display YouTube search results
 */
function displayYouTubeResults(videos) {
    youtubeSearchResults.innerHTML = '';
    
    // Show clear button
    if (clearSearchBtn) {
        clearSearchBtn.style.display = 'block';
    }
    
    if (videos.length === 0) {
        youtubeSearchResults.innerHTML = '<div class="col-12"><p class="text-center text-muted">No results found. Try a different search term.</p></div>';
        return;
    }
    
    videos.forEach(video => {
        // Check if video already in current playlist
        const isInPlaylist = currentPlaylist && currentPlaylist.videos.some(v => v.videoId === video.videoId);
        
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        col.innerHTML = `
            <div class="card h-100 ${isInPlaylist ? 'border-success' : ''}">
                <img src="${video.thumbnail}" 
                     alt="${video.title}" 
                     class="card-img-top" 
                     style="height: 200px; object-fit: cover; cursor: pointer;"
                     onclick="playVideo('${video.videoId}')"
                     title="Click to play">
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${video.title}</h6>
                    <div class="d-flex justify-content-between text-muted small mb-2">
                        <span>${formatDuration(video.duration)}</span>
                        <span>${formatViewCount(video.viewCount)}</span>
                    </div>
                    <div class="d-flex gap-2 mt-auto">
                        <button class="btn btn-success btn-sm play-youtube-btn" data-video-id="${video.videoId}">
                            <i class="fas fa-play"></i> Play
                        </button>
                        <button class="btn ${isInPlaylist ? 'btn-secondary' : 'btn-primary'} btn-sm add-to-playlist-btn flex-grow-1" 
                                data-video-id="${video.videoId}"
                                data-video-title="${video.title.replace(/"/g, '&quot;')}"
                                data-video-thumbnail="${video.thumbnail}"
                                ${isInPlaylist ? 'disabled' : ''}>
                            ${isInPlaylist ? '<i class="fas fa-check-circle"></i> Added' : '<i class="fas fa-plus"></i> Add'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        youtubeSearchResults.appendChild(col);
    });
    
    // Scroll to results
    setTimeout(() => {
        youtubeSearchResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    // Attach event listeners
    document.querySelectorAll('.play-youtube-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video-id');
            playVideo(videoId);
        });
    });
    
    document.querySelectorAll('.add-to-playlist-btn:not(:disabled)').forEach(btn => {
        btn.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video-id');
            const title = this.getAttribute('data-video-title');
            const thumbnail = this.getAttribute('data-video-thumbnail');
            addYouTubeVideoToPlaylist(videoId, title, thumbnail);
        });
    });
}

/**
 * Add YouTube video to current playlist
 */
function addYouTubeVideoToPlaylist(videoId, title, thumbnail) {
    if (!currentPlaylistId) {
        alert('Please select a playlist first');
        return;
    }
    
    // Check if video already exists in playlist
    const playlists = getUserPlaylists(currentUser.username);
    const playlist = playlists.find(p => p.id === currentPlaylistId);
    
    if (playlist && playlist.videos.some(v => v.videoId === videoId)) {
        alert('This video is already in the playlist');
        return;
    }
    
    // Create video object
    const video = {
        videoId: videoId,
        title: title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: thumbnail,
        type: 'youtube',
        rating: 1  // Default rating is 1 (not 0)
    };
    
    // Add video to playlist
    const added = addVideoToPlaylist(currentUser.username, currentPlaylistId, video);
    
    if (added) {
        // Refresh display
        selectPlaylist(currentPlaylistId);
        showToast('Video added to playlist successfully!');
        // Refresh YouTube search results to update "Added" status
        if (youtubeSearchInput.value.trim()) {
            youtubeSearchBtn.click();
        }
    } else {
        alert('Failed to add video to playlist');
    }
}

/**
 * Toggle view mode between table and cards
 */
function toggleViewMode() {
    viewMode = viewMode === 'table' ? 'cards' : 'table';
    
    // Update icon
    if (viewMode === 'table') {
        viewToggleIcon.className = 'fas fa-th';
    } else {
        viewToggleIcon.className = 'fas fa-table';
    }
    
    // Re-render with current videos
    if (currentPlaylist && currentPlaylist.videos.length > 0) {
        displayPlaylistVideos(allVideos.length > 0 ? allVideos : currentPlaylist.videos);
    }
}

// Event Listeners

// YouTube search
if (youtubeSearchBtn && youtubeSearchInput) {
    youtubeSearchBtn.addEventListener('click', async function() {
        const query = youtubeSearchInput.value.trim();
        if (!query) {
            alert('Please enter a search term');
            return;
        }
        
        youtubeSearchBtn.disabled = true;
        youtubeSearchBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Searching...';
        
        const videos = await searchYouTube(query);
        displayYouTubeResults(videos);
        
        youtubeSearchBtn.disabled = false;
        youtubeSearchBtn.innerHTML = '<i class="fas fa-search me-1"></i>Search';
    });
    
    // Enter key in YouTube search input
    youtubeSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            youtubeSearchBtn.click();
        }
    });
    
    // Clear search button
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearYouTubeSearch);
    }
}

// View toggle button
if (viewToggleBtn) {
    viewToggleBtn.addEventListener('click', toggleViewMode);
}

// Enter key in YouTube search input
youtubeSearchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        youtubeSearchBtn.click();
    }
});

// View toggle button
viewToggleBtn.addEventListener('click', toggleViewMode);

// New playlist button
newPlaylistBtn.addEventListener('click', function() {
    if (!newPlaylistModal) {
        newPlaylistModal = new bootstrap.Modal(newPlaylistModalElement);
    }
    newPlaylistNameInput.value = '';
    newPlaylistModal.show();
});

// Close new playlist modal
if (closeNewPlaylistModal) {
    closeNewPlaylistModal.addEventListener('click', function() {
        if (newPlaylistModal) {
            newPlaylistModal.hide();
        }
    });
}
if (closeNewPlaylistModalBtn) {
    closeNewPlaylistModalBtn.addEventListener('click', function() {
        if (newPlaylistModal) {
            newPlaylistModal.hide();
        }
    });
}

// Create playlist button
createPlaylistBtn.addEventListener('click', function() {
    const playlistName = newPlaylistNameInput.value.trim();
    if (!playlistName) {
        alert('Please enter a playlist name');
        return;
    }
    
    const newPlaylist = createPlaylist(currentUser.username, playlistName);
    if (newPlaylistModal) {
        newPlaylistModal.hide();
    }
    loadPlaylists();
    selectPlaylist(newPlaylist.id);
    
    showToast('Playlist created successfully!');
});

// Play playlist button
playPlaylistBtn.addEventListener('click', function() {
    if (!currentPlaylist || currentPlaylist.videos.length === 0) {
        alert('Playlist is empty');
        return;
    }
    
    // Open first video in modal (you can enhance this to play all videos)
    const firstVideo = currentPlaylist.videos[0];
    if (firstVideo.type === 'youtube') {
        window.open(`https://www.youtube.com/watch?v=${firstVideo.videoId}`, '_blank');
    } else {
        alert('MP3 playback not implemented in this version');
    }
});

// Search input
searchPlaylistInput.addEventListener('input', handlePlaylistSearch);

// Sort button
sortBtn.addEventListener('click', function() {
    if (sortOrder === 'name') {
        sortOrder = 'rating';
        sortBtn.textContent = 'Sort by Rating';
    } else {
        sortOrder = 'name';
        sortBtn.textContent = 'Sort A-Z';
    }
    
    if (currentPlaylist) {
        displayPlaylistVideos(currentPlaylist.videos);
    }
});

// Logout button
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            clearCurrentUser();
            window.location.href = 'login.html';
        }
    });
}

// Modal is handled by Bootstrap, no need for manual click outside handling

// Check for toast notification from search page
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const showToast = urlParams.get('showToast');
    const playlistId = urlParams.get('playlistId');
    
    if (showToast === 'true' && playlistId) {
        showToast('Video added to playlist!', `playlists.html?playlistId=${playlistId}`, 'Go to Playlist');
    }
});

// Initialize page
if (checkAuthentication()) {
    initializeUserHeader();
    loadPlaylists();
}

// Ensure logout button works - retry if not found initially
if (!logoutBtn) {
    document.addEventListener('DOMContentLoaded', function() {
        const logoutBtnRetry = document.getElementById('logoutBtn');
        if (logoutBtnRetry) {
            logoutBtnRetry.addEventListener('click', function() {
                if (confirm('Are you sure you want to logout?')) {
                    clearCurrentUser();
                    window.location.href = 'login.html';
                }
            });
        }
    });
}

