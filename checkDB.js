import mongoose from "mongoose";
import User from "./models/User.js";
import Police from "./models/Police.js";
import Complaint from "./models/Complaint.js";
import dotenv from "dotenv";

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const users = await User.find();
        console.log("CITIZEN USERS:");
        users.forEach(u => console.log(`- ${u.email} [Role: ${u.role}]`));

        const police = await Police.find();
        console.log("\nPOLICE USERS:");
        police.forEach(p => console.log(`- ${p.email} [Role: ${p.role}]`));

        const complaints = await Complaint.find();
        console.log("\nCOMPLAINTS:");
        complaints.forEach(c => console.log(`- ID: ${c._id} | Name: ${c.name} | Status: ${c.status}`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

test();
