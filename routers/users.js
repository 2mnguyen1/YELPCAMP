const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const users = require('../controllers/users');
const { render } = require('express/lib/response');

// register
router.route('/register')
    .get( users.renderRegister)
    .post( catchAsync(users.register));
// login    
router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);
// logout
router.get('/logout', users.logout);




module.exports = router;