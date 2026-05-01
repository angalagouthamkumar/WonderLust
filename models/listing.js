const { ref, string } = require("joi");
const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{
        type:String,
        required : true,
    },
    description:String,
    image: {
        url : String,
        filename: String,
    },
    price:Number,
    address: {
        type: String,
        default: ""
    },
    location:String,
    country:String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
        //required: true
    },
    geometry: {
        type: {
            type: String, 
            enum: ['Point'], // Must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        },
    },
    category : {
        type: String,
        enum : ["Trending","Rooms","Iconic Cities","Mountains","Castles","Amazing Pools","Camping","Farms","Arctic"]
    }
});

listingSchema.post("findOneAndDelete", async (listing) =>{
    if(listing){
        await review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;