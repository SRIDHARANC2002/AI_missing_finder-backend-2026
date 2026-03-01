import axios from "axios";
import FormData from "form-data";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "https://ai-service-1-yf88.onrender.com";

/* =============================
   GENERATE EMBEDDING FROM BUFFER
============================= */
export const generateEmbedding = async (fileBuffer) => {

  const formData = new FormData();

  formData.append("file", fileBuffer, {
    filename: "face.jpg",
    contentType: "image/jpeg",
  });

  const response = await axios.post(
    `${AI_SERVICE_URL}/extract-embedding`,
    formData,
    {
      headers: formData.getHeaders(),
      timeout: 30000,
    }
  );

  const embedding = response.data?.embedding;

  if (!embedding || !Array.isArray(embedding)) {
    throw new Error("Invalid embedding returned");
  }

  return embedding;
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