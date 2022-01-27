const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    img: String,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId, 
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function(camp){
    if (camp){
        await Review.deleteMany({
            _id: {
                $in: camp.reviews
            }
        })
    }
    console.log(camp.reviews)
}) // delete any reviews that have id inside camp.review


module.exports = mongoose.model('Campground', CampgroundSchema);

