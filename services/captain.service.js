const captainModel = require('../models/captain.model');

const createCaptain = async ({ fullname, email, password, color, plate, capacity, vehicleType }) => {
    // Validate that all required fields are provided
    if (!fullname || !password || !email || !color || !plate || !capacity || !vehicleType) {    
        throw new Error('All fields are required');
    }

    // Create the captain in the database
    const captain = await captainModel.create({
        fullname,
        email,
        password,
        vehicle: {
            color,
            plate,
            capacity,
            vehicleType
        }
    });

    return captain;
}

module.exports = { createCaptain };
