/**
 * Node.js/Express Server for WebDev Project
 * 
 * This server provides:
 * - Static file serving
 * - User authentication API (register, login, logout)
 * - Playlist management API
 * - MP3 file upload support
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the project root (like Code 2 example)
app.use(express.static(__dirname));

// Serve MP3 files from uploads directory (like Code 2 example)
app.use('/mp3', express.static(path.join(__dirname, 'uploads')));

// Create data and uploads directories if they don't exist
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for MP3 file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept only MP3 files
        if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3' || 
            file.originalname.toLowerCase().endsWith('.mp3')) {
            cb(null, true);
        } else {
            cb(new Error('Only MP3 files are allowed'));
        }
    }
});

// File paths
const USERS_FILE = path.join(dataDir, 'users.json');
const PLAYLISTS_FILE = path.join(dataDir, 'playlists.json');

/**
 * Read users from JSON file
 */
function getUsers() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading users file:', error);
    }
    return [];
}

/**
 * Save users to JSON file
 */
function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving users file:', error);
        return false;
    }
}

/**
 * Read playlists from JSON file
 */
function getPlaylists() {
    try {
        if (fs.existsSync(PLAYLISTS_FILE)) {
            const data = fs.readFileSync(PLAYLISTS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading playlists file:', error);
    }
    return {};
}

/**
 * Save playlists to JSON file
 */
function savePlaylists(playlists) {
    try {
        fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving playlists file:', error);
        return false;
    }
}

// ==================== API Routes ====================

/**
 * GET /api/users
 * Get all users (for testing/debugging)
 */
app.get('/api/users', (req, res) => {
    const users = getUsers();
    // Don't send passwords in response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
});

/**
 * POST /api/register
 * Register a new user
 */
app.post('/api/register', (req, res) => {
    const { username, password, firstName, imageUrl } = req.body;

    // Validation
    if (!username || !password || !firstName || !imageUrl) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Password validation
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasNonAlphanumeric = /[^a-zA-Z0-9]/.test(password);

    if (!hasLetter || !hasNumber || !hasNonAlphanumeric) {
        return res.status(400).json({ 
            error: 'Password must contain at least one letter, one number, and one non-alphanumeric character' 
        });
    }

    // Check if username already exists
    const users = getUsers();
    if (users.some(u => u.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    // Create new user
    const newUser = {
        username,
        password, // In production, hash this!
        firstName,
        imageUrl
    };

    users.push(newUser);
    
    if (saveUsers(users)) {
        // Return user without password
        const { password, ...userWithoutPassword } = newUser;
        res.status(201).json({ 
            message: 'User registered successfully',
            user: userWithoutPassword 
        });
    } else {
        res.status(500).json({ error: 'Failed to save user' });
    }
});

/**
 * POST /api/login
 * Login user
 */
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.json({ 
            message: 'Login successful',
            user: userWithoutPassword 
        });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

/**
 * POST /api/logout
 * Logout user (client-side mainly, but we can track it if needed)
 */
app.post('/api/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});

/**
 * GET /api/playlists/:username
 * Get all playlists for a user
 */
app.get('/api/playlists/:username', (req, res) => {
    const { username } = req.params;
    const playlists = getPlaylists();
    const userPlaylists = playlists[username] || [];
    console.log(`Loading playlists for user: ${username}, found ${userPlaylists.length} playlists`);
    res.json(userPlaylists);
});

/**
 * POST /api/playlists/:username
 * Save playlists for a user
 */
app.post('/api/playlists/:username', (req, res) => {
    const { username } = req.params;
    const playlistsArray = req.body;

    console.log(`Saving playlists for user: ${username}`);
    console.log(`Playlists data:`, JSON.stringify(playlistsArray, null, 2));

    if (!Array.isArray(playlistsArray)) {
        console.error('Error: Playlists must be an array');
        return res.status(400).json({ error: 'Playlists must be an array' });
    }

    const playlists = getPlaylists();
    playlists[username] = playlistsArray;

    if (savePlaylists(playlists)) {
        console.log(`Successfully saved ${playlistsArray.length} playlists for ${username}`);
        res.json({ message: 'Playlists saved successfully' });
    } else {
        console.error(`Failed to save playlists for ${username}`);
        res.status(500).json({ error: 'Failed to save playlists' });
    }
});

/**
 * POST /api/upload
 * Upload MP3 file
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the URL to access the file
    const fileUrl = `/mp3/${req.file.filename}`;
    res.json({ 
        message: 'File uploaded successfully',
        url: fileUrl,
        filename: req.file.filename
    });
});

// MP3 files are served via express.static('/mp3', uploadsDir) above
// No need for separate route handler

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB' });
        }
        return res.status(400).json({ error: err.message });
    }
    
    if (err) {
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
    
    next();
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Data directory: ${dataDir}`);
    console.log(`Uploads directory: ${uploadsDir}`);
});

