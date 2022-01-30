if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

console.log(process.env.SECRET);

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/users');
// express router

const usersRoute = require('./routers/users')
const campgroundsRoute = require('./routers/campgrounds')
const reviewsRoute = require('./routers/reviews')

mongoose.connect('mongodb://localhost:27017/YELPCAMP');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


const sessionConfig = {
    secret: 'thisissecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig)) // before passport session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(flash());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeuser', async (req, res) => {
    const user = new User({
        email: 'minh@gmail.com',
        username: 'minh',
    })
    const newUser = await User.register(user, 'minhga');
    res.send(newUser);
})

app.get('/', (req, res) => {
    res.render('home');
})

app.use('/', usersRoute);
app.use('/campgrounds', campgroundsRoute);
app.use('/campgrounds/:id/reviews', reviewsRoute)




app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { message = 'Something went wrong', status = 500 } = err;
    res.status(status).render('error', { err });
})

app.listen('3000', () => {
    console.log('3000 PORT')
})