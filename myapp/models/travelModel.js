const mongoose = require('mongoose');
const {
    default: slugify
} = require('slugify');

const travelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A Travel must have a name'],
        unique: true,
        trim: true,
        maxlenght: [40, 'A travel name must have less or equal then 40 characters'],
        minlenght: [5, 'A travel name must have more or equal then 5 characters']
    },
    slug: String,
    country: {
        type:String,
        lowercase: true
    },
    summary: String,
    description: String,
    imageCover: String,
    images: [String],
    createAt: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: [true, 'Obligatoire']
    },
    review:{
        type: mongoose.Schema.ObjectId,
        ref: 'Reviews',
        required: [true, 'Obligatoire']
    },
    active: {
        type: Boolean,
        default: false,
        select: false
    }
});


// Virtual populate


travelSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: '-__v -passwordChangedAt'
    })
    next();
})

travelSchema.pre('save', function (next) {
    this.slug = slugify(this.name), {
        lower: true
    };
    next();
});


// Virtual populate
travelSchema.virtual('reviews', {
    ref: 'Reviews',
    foreignField: 'travel',
    localField: '_id'
  });


const Travel = mongoose.model('Travels', travelSchema);

module.exports = Travel;


