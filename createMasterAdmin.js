import mongoose from "mongoose";
import Police from "./models/Police.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = "master@police.com";
        const password = "adminpassword123";

        // Check if exists
        const existing = await Police.findOne({ email });
        if (existing) {
            console.log("Admin already exists. Updating password...");
            existing.password = await bcrypt.hash(password, 10);
            existing.role = "admin";
            await existing.save();
        } else {
            console.log("Creating new admin...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await Police.create({
                policeId: "POL-999",
                email: email,
                password: hashedPassword,
                username: "Master Admin",
                stationName: "Headquarters",
                stationAddress: "Central Station",
                role: "admin"
            });
        }

        console.log("Admin account ready:");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
