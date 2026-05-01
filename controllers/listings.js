const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const maptilerClient = require("@maptiler/client");

maptilerClient.config.apiKey = process.env.MAP_TOKEN;

// Reusable geocoding function
const getCoordinates = async (query) => {
    const response = await maptilerClient.geocoding.forward(query, {
        limit: 5,
        types: ["address", "poi", "place"],
        country: ["in"]
    });

    if (!response.features.length) return null;

    let feature =
        response.features.find(f => f.place_type?.includes("address")) ||
        response.features.find(f => f.place_type?.includes("poi")) ||
        response.features[0];

    return {
        coords: feature.center,
        place: feature.place_name
    };
};

// INDEX
module.exports.index = wrapAsync(async (req, res) => {
    const alllistings = await Listing.find({});
    res.render("listings/index.ejs", { alllistings });
});

// NEW
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// SHOW
module.exports.showListing = wrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
});

// CREATE
module.exports.createListing = wrapAsync(async (req, res) => {
    if (!req.file) {
        req.flash("error", "No image uploaded!");
        return res.redirect("/listings/new");
    }

    const { address, location, country } = req.body.listing;

    const query = [address, location, country]
    .filter(Boolean)
    .map(s => s.trim())
    .join(", ");

    const geoData = await getCoordinates(query);

    if (!geoData) {
        req.flash("error", "Invalid location");
        return res.redirect("/listings/new");
    }

    let url = req.file.path || req.file.url;
    let filename = req.file.filename || req.file.public_id;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    newListing.geometry = {
        type: "Point",
        coordinates: geoData.coords
    };

    await newListing.save();

    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
});

// EDIT
module.exports.renderEditForm = wrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
});

// UPDATE
module.exports.updateListing = wrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    const { address, location, country } = req.body.listing;

    const newQuery = [address, location, country]
        .filter(Boolean)
        .join(", ");

    const oldQuery = [listing.address, listing.location, listing.country]
        .filter(Boolean)
        .join(", ");

    let updatedData = { ...req.body.listing };

    if (newQuery !== oldQuery) {
        const geoData = await getCoordinates(newQuery);

        if (!geoData) {
            req.flash("error", "Invalid location");
            return res.redirect(`/listings/${id}/edit`);
        }

        updatedData.geometry = {
            type: "Point",
            coordinates: geoData.coords
        };
    }

    let updatedListing = await Listing.findByIdAndUpdate(id, updatedData, { new: true });

    if (req.file) {
        let url = req.file.path || req.file.url;
        let filename = req.file.filename || req.file.public_id;
        updatedListing.image = { url, filename };
        await updatedListing.save();
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
});

// DELETE
module.exports.deleteListing = wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
});