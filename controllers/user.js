require('../config');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.createUser = (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash,
        });
        user.save().then(result => {
            res.json({
                message: 'User created',
                result
            });
        }).catch(err => {
            res.status(501).json({
                message: 'This user already exists',
            });
        });
    });
}

exports.userLogin = (req, res, next) => {
    let fetchUser;
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: 'Invalid credentials',
                });
            }
            fetchUser = user;
            return bcrypt.compare(req.body.password, user.password);
        })
        .then(result => {
            if (!result) {
                return res.status(401).json({
                    message: 'Auth failed',
                });
            }
            const token = jwt.sign({ email: fetchUser.email, userId: fetchUser._id }, process.env.SEED_SECRET, { expiresIn: '1h' });
            res.json({
                token,
                expiresIn: 3600,
                userId: fetchUser._id
            });
        })
        .catch(err => {
            res.status(401).json({
                message: 'Auth failed',
                err
            });
        });
}