const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const User = require('../models/user');

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        const user = new User(data);
        const response = await user.save();
        console.log('Data Saved Successfully');

        const payload = {
            id: response._id,  
            email: response.email
        };

        // Generate token
        const token = generateToken(payload);

        // Send response with user details and token
        res.status(200).json({ user: response, token });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { adhaarcardnumber, password } = req.body;
        const user = await User.findOne({ adhaarcardnumber });

        // Check if user exists and password matches
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload = {
            id: user.id,
            role: user.role,
            name: user.name
        };

        // Generate token
        const token = generateToken(payload);

        // Return token and user details
        res.status(200).json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
});

// Profile route (protected)
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Ensure to declare userId as const
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
});

// Update password route (protected)
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        // Check if old password matches
        if (!(await user.comparePassword(oldPassword))) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        // Set new password and save
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.log('Error updating password:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
