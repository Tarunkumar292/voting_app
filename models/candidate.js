const mongoose = require('mongoose');

const candidateschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    party: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    votes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        votedAt: {
            type: Date,
            default: Date.now // Corrected default Date.now()
        }
    }],
    voteCount: {
        type: Number,
        default: 0
    }
});

// Optionally, add an index to improve query performance on party or name
candidateschema.index({ party: 1 });

const Candidate = mongoose.model('Candidate', candidateschema);
module.exports = Candidate;
