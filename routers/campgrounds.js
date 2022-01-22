const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campgrounds');
const { campgroundSchema } = require('../schemas');
const flash = require('connect-flash/lib/flash');


const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// show all
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))
// new
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})
router.post('/', validateCampground, catchAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid campground', 404);
    req.flash('success', 'Sucessfully made a new campground!');
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
}))
// show one 
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    if (!campground){
        req.flash('error', 'Cannot find campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))

// edit and update
router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground){
        req.flash('error', 'Cannot find campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    req.flash('success', 'Successfully updated campground!');
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { runValidators: true, new: true });
    res.redirect(`/campgrounds/${campground._id}`);
}))
// delete
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}))


module.exports = router;