const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campgrounds');
const flash = require('connect-flash/lib/flash');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage })


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground , catchAsync(campgrounds.newCampgrounds))
router.get('/new', isLoggedIn, campgrounds.newRoute);

router.route('/:id')
    .get(catchAsync(campgrounds.showOneCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCampgroundForm))


module.exports = router;