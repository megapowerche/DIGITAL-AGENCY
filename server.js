require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vasu:Vasu25112002@cluster0.oilmo.mongodb.net/safesure?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
.then(async () => {
    console.log('Connected to MongoDB Atlas');
    
    // Check if admin user exists
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
        // Create default admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            username: 'admin',
            email: 'admin@safesure.com',
            password: hashedPassword,
            role: 'admin'
        });
        console.log('Default admin user created');
    }
})
.catch(err => console.error('MongoDB connection error:', err));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'safesure_jwt_secret_key_2024';

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Service Inquiry Schema
const inquirySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    service: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in progress', 'completed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Admin Middleware
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/auth/status', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ authenticated: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/inquiries', authenticateToken, async (req, res) => {
    try {
        const inquiry = new Inquiry({
            userId: req.user.id,
            ...req.body
        });
        await inquiry.save();
        res.status(201).json(inquiry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/user/inquiries', authenticateToken, async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ userId: req.user.id });
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/admin/inquiries', authenticateToken, isAdmin, async (req, res) => {
    try {
        const inquiries = await Inquiry.find().populate('userId', 'username email');
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/inquiries/:id/status', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const inquiry = await Inquiry.findById(req.params.id);
        
        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        inquiry.status = status;
        await inquiry.save();
        res.json({ message: 'Status updated successfully', inquiry });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Serve HTML files
app.get('/admin/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.get('/admin/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'register.html'));
});

app.get('/user/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'user', 'dashboard.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 