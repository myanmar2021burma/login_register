import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// 1. Generate Token
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// 2. Register User
export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Please fill all the fields'
            });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const user = await User.create({
            username,
            email,
            password
        });

        // Token ထုတ်ရန်
        const token = generateToken(user._id);

        res.status(201).json({
            id: user._id,
            username: user.username,
            email: user.email,
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error'
        });
    }
};

// 3. Login User
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                message: 'Please fill all the fields'
            });
        }

        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error'
        });
    }
};

// 4. Get Current User
export const getMe = async (req, res) => {
    res.status(200).json(req.user);
};
