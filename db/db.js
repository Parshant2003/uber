const mongoose = require('mongoose');

function connectToDb() {
    mongoose.connect(process.env.DB_CONNECT)
        .then(() => {
            console.log("Database se connection ban gaya hai");
        })
        .catch(err => {
            console.log("Database se connection banane mein error aa gaya:", err);
        });
}

module.exports = connectToDb;