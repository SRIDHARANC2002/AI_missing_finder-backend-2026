import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const AI_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
console.log("Testing connection to AI Service at:", AI_URL);

try {
    const rootRes = await axios.get(AI_URL);
    console.log("Successfully reached AI Service Root:", rootRes.data);

    // Test a verify attempt with a dummy image (just a tiny valid jpeg buffer)
    const dummyImage = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElK1V12V1hZWmNkZWZnaGlqc3R1dnd4eXqGhcXl5iZmqjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oADAMBAAIRAxEAPwAf/9k=', 'base64');
    const formData = new FormData();
    formData.append('image1', dummyImage, { filename: 'test.jpg' });
    formData.append('image2_url', 'https://res.cloudinary.com/dd41lxzin/image/upload/v1740217595/missing-persons/u6m8l0y7v5n4z3x2w1v0.jpg'); // Sample URL from previous step

    console.log("Testing /verify endpoint...");
    const verifyRes = await axios.post(`${AI_URL}/verify`, formData, {
        headers: formData.getHeaders()
    });
    console.log("/verify Response:", verifyRes.data);

} catch (err) {
    console.error("Test failed:", err.response?.data || err.message);
}

