const mongoose = require('mongoose');
const Review = require('./review');
const { Schema, model } = mongoose;
const opts = { toJSON: { virtuals: true } };

// https://res.cloudinary.com/ivaldas/image/upload/v1660286395/YelpCamp/l81kdqnqtc3esbtlhk5b.jpg

const ImageSchema = new Schema({
	url: String,
	filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
	return this.url.replace('/upload', '/upload/w_200');
});
const CampgroundSchema = new Schema(
	{
		title: String,
		images: [ ImageSchema ],
		geometry: {
			type: {
				type: String,
				enum: [ 'Point' ],
				required: true
			},
			coordinates: {
				type: [ Number ],
				required: true
			}
		},
		price: Number,
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
	},
	opts
);

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
	return `
	<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
	<p>${this.description.substring(0, 40)}...</p>`;
});

CampgroundSchema.post('findOneAndDelete', async function(doc) {
	if (doc) {
		await Review.deleteMany({ _id: { $in: doc.reviews } });
	}
});

const Campground = model('Campground', CampgroundSchema);

module.exports = Campground;
