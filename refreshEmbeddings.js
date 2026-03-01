import mongoose from "mongoose";
import dotenv from "dotenv";
import Complaint from "./models/Complaint.js";
import { generateEmbeddingFromUrl } from "./ai-model/faceEmbedding.js";

dotenv.config();

const refreshEmbeddings = async () => {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(process.env.MONGO_URI);

        const complaints = await Complaint.find({
            $or: [
                { faceEmbedding: { $exists: false } },
                { faceEmbedding: { $size: 0 } }
            ]
        });

        console.log(`Found ${complaints.length} complaints missing embeddings.`);

        for (const complaint of complaints) {
            console.log(`Processing complaint: ${complaint.name} (${complaint._id})...`);
            try {
                const embedding = await generateEmbeddingFromUrl(complaint.imageUrl);
                complaint.faceEmbedding = embedding;
                await complaint.save();
                console.log("✅ Success");
            } catch (err) {
                console.error(`❌ Failed for ${complaint.name}:`, err.message);
            }
        }

        console.log("Refresh complete!");
        process.exit(0);
    } catch (err) {
        console.error("Critical error:", err);
        process.exit(1);
    }
};

refreshEmbeddings();
