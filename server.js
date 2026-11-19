const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to SEGREMED Backend!");
});

const PORT = 5001;
//api for waste categories
const apiwaste=require('./routes/WasteCategories');

app.use('/api',apiwaste);

//api for waste request
const waste_request=require('./routes/WasteRequest');
app.use('/api/request',waste_request);

// API for collection scheduling
const collectionScheduling = require('./routes/CollectionScheduling');
app.use('/api/collection', collectionScheduling);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


