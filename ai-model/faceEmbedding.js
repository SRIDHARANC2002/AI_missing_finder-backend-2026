import axios from "axios";
import FormData from "form-data";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "https://ai-service-1-yf88.onrender.com";

/* =============================
   GENERATE EMBEDDING FROM BUFFER
============================= */
export const generateEmbedding = async (fileBuffer) => {
  try {
    const formData = new FormData();

    formData.append("file", fileBuffer, {
      filename: "face.jpg",
      contentType: "image/jpeg",
    });

    console.log("Calling AI:", AI_SERVICE_URL);

    const response = await axios.post(
      `${AI_SERVICE_URL}/extract-embedding`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 60000,   // ⬅️ increase timeout
      }
    );

    const embedding = response.data?.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error("Invalid embedding returned");
    }

    return embedding;

  } catch (error) {
    console.error("AI ERROR STATUS:", error.response?.status);
    console.error("AI ERROR DATA:", error.response?.data);
    console.error("AI ERROR MESSAGE:", error.message);
    throw error;
  }
};

/* =============================
   GENERATE EMBEDDING FROM URL
============================= */
export const generateEmbeddingFromUrl = async (imageUrl) => {

  const { data: arrayBuffer } = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    timeout: 30000,
  });

  return await generateEmbedding(Buffer.from(arrayBuffer));
};