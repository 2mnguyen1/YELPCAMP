const Campground = require('../models/campgrounds');
const { cloudinary } = require('../cloudinary/index');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken }); // forward and reverse method


// all 
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}


// new 
module.exports.newRoute = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.newCampgrounds = async (req, res) => {
    const geoData = geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    })
    await geoData.send();
    const newCampground = new Campground(req.body.campground);
    newCampground.geometry = geoData.response.body.features[0].geometry;
    newCampground.img = req.files.map(file => ({
        url: file.path,
        filename: file.filename
    }))
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash('success', 'Sucessfully made a new campground!');
    res.redirect(`/campgrounds/${newCampground._id}`);
}


//show one 
module.exports.showOneCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

// edit 

module.exports.editCampgroundForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}
module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { runValidators: true, new: true });
    const imgs = req.files.map(file => ({
        url: file.path,
        filename: file.filename
    }))
    campground.img.push(...imgs)
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { img: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

// delete a camp

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}