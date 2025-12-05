# WebDev Course Project - Stage A

A web-based music/video playlist management system with user authentication, YouTube video search, and playlist management.

## Project Structure

```
Project/
├── index.html              # Main landing page
├── register.html           # User registration page
├── login.html              # User login page
├── search.html             # YouTube video search page
├── playlists.html          # Playlist management page
└── js/
    ├── storage.js         # LocalStorage/SessionStorage utilities
    ├── register.js        # Registration functionality
    ├── login.js           # Login functionality
    ├── search.js          # YouTube search and video management
    └── playlists.js       # Playlist management functionality
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
  - Search within playlist
  - Sort by name (A-Z) or rating
  - Rate videos (0-5)
  - Delete videos or entire playlists
- Toast notifications with links
- Query string support for direct playlist access

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

**playlists.js:**
- Playlist management
- Video rating
- Search and sort
- Delete operations
- Toast notifications

## Setup Instructions

1. **Get YouTube API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable YouTube Data API v3
   - Create credentials (API Key)
   - Replace `YOUR_YOUTUBE_API_KEY_HERE` in `js/search.js`

2. **Update Student Information:**
   - Edit `index.html` and update:
     - Student name (line with `id="studentName"`)
     - Student ID (line with `id="studentId"`)
     - GitHub link
     - Live website link

3. **Run the Project:**
   - Open `index.html` in a web browser
   - Or use a local server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server
     ```

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

4. **Playlists:**
   - View all playlists in sidebar
   - Select playlist to view content
   - Rate videos
   - Search and sort within playlist
   - Delete videos or playlists

## Notes

- All data is stored in browser localStorage (client-side only)
- Passwords are stored in plain text (NOT secure - for educational purposes only)
- YouTube API has quota limits
- MP3 upload feature mentioned in requirements is not fully implemented in this version

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Requires localStorage and sessionStorage support
