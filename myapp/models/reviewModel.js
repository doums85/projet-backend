const mongoose = require("mongoose");
// user | travel
const reviewSchema = mongoose.Schema({
    comment: String,
    like: Number,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: [true, 'You aren\'t logged! Please login and try angain']
    },
    travel: {
        type: mongoose.Schema.ObjectId,
        ref: 'Travels',
        required: [true, 'Review msut belong to a travel']
    },
    createAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

reviewSchema.index({
    travel: 1,
    user: 1
}, {
    unique: true
})

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
})


const Review = mongoose.model('Reviews', reviewSchema)

module.exports = Review;