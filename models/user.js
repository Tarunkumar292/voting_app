const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] // Added email validation
    },
    mobile: {
        type: Number
    },
    address: {
        type: String,
        required: true
    },
    adhaarcardnumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }
});

// Hash password before saving
userschema.pre('save', async function(next) {
    const user = this;

    // Hash the password only if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    try {
        // Generate salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        // Override the plain password with the hashed one
        user.password = hashedPassword;
        next();
    } catch (err) {
        return next(err);
    }
});

// Compare password method
userschema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Use bcrypt to compare the provided password with the stored hashed password
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
        throw err;
    }
}

const User = mongoose.model('User', userschema);
module.exports = User;
