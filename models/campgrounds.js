const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema({
    url: String,
    filename: String,
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: {virtuals: true} }

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    img: [ImageSchema],
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            require: true
        },
        coordinates: {
            type: [Number],
            require: true,
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong><br>
    <strong>Click for more!</strong>
    `
})



CampgroundSchema.post('findOneAndDelete', async function (camp) {
    if (camp) {
        await Review.deleteMany({
            _id: {
                $in: camp.reviews
            }
        })
    }
}) // delete any reviews that have id inside camp.review


module.exports = mongoose.model('Campground', CampgroundSchema);

