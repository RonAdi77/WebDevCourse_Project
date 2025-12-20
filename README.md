# WebDev Course Project - Part A (Live Server - Client-Side Only)

A web-based music/video playlist management system with user authentication, YouTube video search, and playlist management. **This version is client-side only** and works with Live Server. All data is stored in browser localStorage.

## Project Structure

```
Project/
├── index.html              # Main landing page
├── register.html           # User registration page
├── login.html              # User login page
├── search.html             # YouTube video search page
├── playlists.html          # Playlist management page
├── js/
│   ├── storage.js         # LocalStorage/SessionStorage utilities
│   ├── register.js        # Registration functionality
│   ├── login.js           # Login functionality
│   ├── search.js          # YouTube search and video management
│   └── playlists.js       # Playlist management functionality
```

**Note:** This project uses **Bootswatch Cyborg Theme** (Bootstrap 5) and **Font Awesome 6.0.0** via CDN for all styling and icons. No local CSS files are needed.

## Features

### 1. Index Page (`index.html`)
- Displays student information (name, ID)
- Links to GitHub repository and live website
- Link to login/register pages

### 2. Registration Page (`register.html`)
- User registration form with validation:
  - Username (must be unique)
  - Password (must contain: letter, number, non-alphanumeric, min 6 chars)
  - Password confirmation
  - First name
  - Image URL
- Saves users to localStorage
- Redirects to login page on success

### 3. Login Page (`login.html`)
- Username and password authentication
- Validates against localStorage
- Saves current user to sessionStorage
- Redirects to search page on success
- Prevents access if already logged in

### 4. Search Page (`search.html`)
- Displays logged-in user info in header
- YouTube video search using YouTube Data API
- Displays results as cards with:
  - Video thumbnail
  - Title (2 lines max, tooltip on hover)
  - Duration
  - View count
  - Play button
  - Add to favorites button
- Video player modal
- Add to favorites modal (create new or select existing playlist)
- Visual indicator if video is already in favorites
- Toast notifications with links to playlists

### 5. Playlists Page (`playlists.html`)
- Sidebar with:
  - "My Library" title
  - "New Playlist" button
  - List of all user playlists
  - "Play Playlist" button
- Main content area:
  - Displays selected playlist content
  - YouTube search within playlist (add videos directly)
  - Dual view mode: Table or Bootstrap Cards (toggle button)
  - Search within playlist
  - Sort by name (A-Z) or rating
  - Rate videos (1-10)
  - Delete videos or entire playlists
- Toast notifications with links
- Query string support for direct playlist access
- Enhanced UI with smooth animations and hover effects

## Technical Details

### Styling Framework

**Bootswatch Cyborg Theme (Bootstrap 5):**
- All styling is done using Bootstrap classes via CDN
- Dark theme with cyberpunk aesthetic
- Responsive design built-in
- No local CSS files required

**Font Awesome 6.0.0:**
- Icon library for all icons throughout the application
- Used instead of Bootstrap Icons

### Storage System

**localStorage:**
- `users`: Array of all registered users
- `playlists`: Object with user playlists (key: username, value: array)

**sessionStorage:**
- `currentUser`: Currently logged-in user object
- `lastSearchQuery`: Last search query (for persistence)
- `lastSearchResults`: Last search results (JSON string, for persistence)

### API Integration

**YouTube Data API:**
- Requires API key (set in `js/search.js` and `js/playlists.js`)
- Searches for videos
- Retrieves video details (duration, view count)

### Key Functions

**storage.js:**
- `getUsers()` - Get all users
- `saveUser(user)` - Save new user
- `verifyUser(username, password)` - Authenticate user
- `getCurrentUser()` - Get logged-in user
- `getUserPlaylists(username)` - Get user's playlists
- `addVideoToPlaylist(username, playlistId, video)` - Add video to playlist
- `createPlaylist(username, name)` - Create new playlist

**register.js:**
- Form validation
- Password strength validation
- Username uniqueness check
- User registration (localStorage only)

**login.js:**
- Authentication (localStorage only)
- Session management
- Redirect handling

**search.js:**
- YouTube API integration
- Video search and display
- Modal video player
- Add to favorites functionality
- Search results persistence (saved in sessionStorage)
- URL query string synchronization (`?q=searchterm`)

**playlists.js:**
- Playlist management (localStorage only)
- YouTube search within playlist
- Dual view modes (table/cards)
- Video rating (1-10)
- Search and sort
- Delete operations
- Toast notifications

## Setup Instructions

1. **Get YouTube API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable YouTube Data API v3
   - Create credentials (API Key)
   - Replace the API key in `js/search.js` and `js/playlists.js` (look for `YOUTUBE_API_KEY`)

2. **Update Student Information:**
   - Edit `index.html` and update:
     - Student name (line with `id="studentName"`)
     - Student ID (line with `id="studentId"`)
     - GitHub link
     - Live website link

3. **Run with Live Server:**
   - Use VS Code Live Server extension, or
   - Use any static file server
   - Open `index.html` in your browser

4. **Access the Application:**
   - Open your browser and navigate to the project directory
   - Or use Live Server to serve the files
   - Start from `index.html`

## Usage Flow

1. **Registration:**
   - Go to register page
   - Fill in all required fields
   - Submit form
   - Redirected to login page

2. **Login:**
   - Enter username and password
   - On success, redirected to search page

3. **Search:**
   - Enter search query
   - View results
   - Click play to watch video
   - Click "Add to Favorites" to add to playlist
   - Search results are saved and restored when navigating back
   - URL is synced with search query (`?q=searchterm`)

4. **Playlists:**
   - View all playlists in sidebar
   - Select playlist to view content
   - Use YouTube search within playlist to add videos directly
   - Toggle between table and card view
   - Rate videos (1-10)
   - Search and sort within playlist
   - Delete videos or playlists

## Data Storage

- **Client-side (localStorage):**
  - `users`: Array of all registered users
  - `playlists`: Object with user playlists (key: username, value: array)
  
- **Client-side (sessionStorage):**
  - `currentUser`: Currently logged-in user
  - `lastSearchQuery`: Last search query
  - `lastSearchResults`: Last search results (JSON)

## Notes

- **No Server Required:** This version works entirely client-side with localStorage
- Passwords are stored in plain text (NOT secure - for educational purposes only)
- YouTube API has quota limits - you need your own API key
- All data is stored in browser localStorage (cleared when browser data is cleared)
- Search results are automatically saved and restored when navigating back
- URL query strings are synced with search queries for bookmarking/sharing
- **MP3 upload functionality is NOT available in this version** (only in Part B with server)
- Enhanced UI with smooth animations and modern design

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Requires localStorage and sessionStorage support

## Differences from Part B (Server Version)

This version (Part A) does NOT include:
- Node.js/Express server
- Server-side user authentication
- Server-side playlist storage
- MP3 file upload functionality
- API endpoints (`/api/register`, `/api/login`, `/api/playlists`, `/api/upload`)

All functionality in Part A uses localStorage only, making it suitable for deployment to static hosting services like GitHub Pages.
