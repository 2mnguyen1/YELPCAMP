const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelper')
mongoose.connect('mongodb://localhost:27017/YELPCAMP');

function sample(array) {
    return array[Math.floor(Math.random() * array.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 50) + 10;
        const camps = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint possimus odio non natus libero necessitatibus quos, nostrum totam veritatis eaque fugit rem qui, numquam dolorem praesentium iste cupiditate nobis iusto?',
            price: price,
            img: 'https://source.unsplash.com/collection/483251'
        })
        await camps.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
});