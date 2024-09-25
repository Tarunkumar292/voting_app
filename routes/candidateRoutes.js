const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware } = require('../jwt');
const User = require('../models/user');
const Candidate = require('../models/candidate');

// Check if the user is an admin
const checkAdmin = async (userID) => {
    try {
        const user = await User.findById(userID);
        return user && user.role === 'admin';
    } catch (err) {
        return false;
    }
};

// Add a new candidate (Admin only)
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdmin(req.user.id))) {
            return res.status(403).json({ message: 'You are not an admin' });
        }

        const data = req.body;
        const candidate = new Candidate(data);
        const response = await candidate.save();
        console.log('Data Saved Successfully');

        res.status(200).json({ response });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
});

// Update a candidate (Admin only)
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdmin(req.user.id))) {
            return res.status(403).json({ message: 'You are not an admin' });
        }

        const candidateID = req.params.candidateID;
        const updatedData = req.body;
        const response = await Candidate.findByIdAndUpdate(candidateID, updatedData, { new: true });

        if (!response) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        res.status(200).json({ response });
    } catch (err) {
        console.log('Error updating candidate:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete a candidate (Admin only)
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdmin(req.user.id))) {
            return res.status(403).json({ message: 'You are not an admin' });
        }

        const candidateID = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        res.status(200).json({ message: 'Candidate deleted successfully', response });
    } catch (err) {
        console.log('Error deleting candidate:', err);
        res.status(500).json({ error: err.message });
    }
});

// Vote for a candidate
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    const candidateID = req.params.candidateID;
    const userID = req.user.id;

    try {
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admin cannot vote' });
        }

        // Record the vote
        candidate.votes.push({ user: userID });
        candidate.voteCount++;
        await candidate.save();

        user.isVoted = true;
        await user.save();

        res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        console.log('Error voting:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get vote count for all candidates
router.get('/vote/count', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: 'desc' }).select('party voteCount');
        res.status(200).json(candidates);
    } catch (err) {
        console.log('Error fetching vote count:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//list of candidates
router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find({}, 'name party -_id');
        res.status(200).json(candidates);
        } catch (err) {
            console.log('Error fetching candidates:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    })

module.exports = router;
