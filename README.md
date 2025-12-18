# WebDev Course Project - Stage B (With Server)

A web-based music/video playlist management system with user authentication, YouTube video search, and playlist management. **This version includes a Node.js/Express server** for user management, playlist storage, and MP3 file uploads.

## Project Structure

```
Project/
├── index.html              # Main landing page
├── register.html           # User registration page
├── login.html              # User login page
├── search.html             # YouTube video search page
├── playlists.html          # Playlist management page
├── server.js               # Node.js/Express server
├── package.json           # Node.js dependencies
├── js/
│   ├── storage.js         # LocalStorage/SessionStorage utilities (fallback)
│   ├── register.js        # Registration functionality (API calls)
│   ├── login.js           # Login functionality (API calls)
│   ├── search.js          # YouTube search and video management
│   └── playlists.js       # Playlist management functionality (API calls)
├── data/                   # Server data files (created automatically)
│   ├── users.json         # User data
│   └── playlists.json     # Playlist data
└── uploads/                # Uploaded MP3 files (created automatically)
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

### 5. Playlists Page (`playlists.html`)
- Sidebar with:
  - "My Library" title
  - "New Playlist" button
  - List of all user playlists
  - "Play Playlist" button
- Main content area:
  - Displays selected playlist content
  - YouTube search within playlist (add videos directly)
  - MP3 file upload support
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
- Requires API key (set in `js/search.js`)
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
- User registration

**login.js:**
- Authentication
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
- Playlist management
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

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Run the Server:**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000`

5. **Access the Application:**
   - Open your browser and go to `http://localhost:3000`
   - Or open `http://localhost:3000/index.html` directly

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

- **Server Required:** This project requires the Node.js server to be running
- Passwords are stored in plain text (NOT secure - for educational purposes only)
- YouTube API has quota limits - you need your own API key
- All data is stored on the server in JSON files (with localStorage fallback)
- Search results are automatically saved and restored when navigating back
- URL query strings are synced with search queries for bookmarking/sharing
- MP3 uploads are stored on the server in the `uploads/` directory
- Enhanced UI with smooth animations and modern design

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Requires localStorage and sessionStorage support
