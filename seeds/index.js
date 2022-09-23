const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

//###################### MONGO / MONGOOSE ##################################

db().catch((err) => console.log('mongo connection error', err));
async function db() {
	await mongoose.connect('mongodb://localhost:27017/yelp-camp');
	console.log('Mongo Database Connected');
}
// brew services start mongodb-community@5.0 --> to start service
// brew services stop mongodb-community@5.0 --> to stop service

//#########################################################################

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 300; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			author: '62e9e9c0c6cc0cf7aa129142',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			description:
				'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nulla aut, natus minus ex harum, corporis laboriosam tenetur sapiente, repellat ab magni libero reprehenderit officiis nam tempore? Atque id repellat facere.',
			price,
			geometry: {
				type: 'Point',
				coordinates: [ cities[random1000].longitude, cities[random1000].latitude ]
			},
			images: [
				{
					url:
						'https://res.cloudinary.com/ivaldas/image/upload/v1660286394/YelpCamp/ys1praft3gmb98pyu1dc.jpg',
					filename: 'YelpCamp/ys1praft3gmb98pyu1dc'
				},
				{
					url:
						'https://res.cloudinary.com/ivaldas/image/upload/v1660286394/YelpCamp/sbbdjff9yukpkuxdiffg.jpg',
					filename: 'YelpCamp/sbbdjff9yukpkuxdiffg'
				},
				{
					url:
						'https://res.cloudinary.com/ivaldas/image/upload/v1660286395/YelpCamp/l81kdqnqtc3esbtlhk5b.jpg',
					filename: 'YelpCamp/l81kdqnqtc3esbtlhk5b'
				}
			]
		});
		await camp.save();
	}
};
seedDB().then(() => {
	mongoose.connection.close();
});
