const campgrounds = require('../models/campgrounds');
const Campground = require('../models/campgrounds');

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
    const newCampground = new Campground(req.body.campground);
    newCampground.img = req.files.map(file => ({
        url: file.path,
        filename: file.filename
    }))
    newCampground.author = req.user._id;
    await newCampground.save();
    console.log(newCampground)
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