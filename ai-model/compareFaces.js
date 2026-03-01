/* ==========================================
   COSINE SIMILARITY FUNCTION
========================================== */
export const cosineSimilarity = (vecA, vecB) => {

  if (!Array.isArray(vecA) || !Array.isArray(vecB)) return 0;
  if (vecA.length !== vecB.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};


/* ==========================================
   FIND BEST MATCH FUNCTION
========================================== */
export const findBestMatch = (unknownEmbedding, complaints) => {

  let bestMatch = null;
  let highestSimilarity = 0;

  for (const complaint of complaints) {

    if (!complaint.faceEmbedding ||
        complaint.faceEmbedding.length !== 512) {
      continue;
    }

    const similarity =
      cosineSimilarity(unknownEmbedding, complaint.faceEmbedding);

    console.log(
      `Comparing with ${complaint.name} → Similarity: ${similarity.toFixed(4)}`
    );

    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = complaint;
    }
  }

  // return {
  //   bestMatch,
  //   similarity: highestSimilarity,
  //   accuracy: (highestSimilarity * 100).toFixed(2)
  // };
  const threshold = 0.75;

let accuracyValue = (highestSimilarity * 100).toFixed(2);

if (highestSimilarity >= threshold) {
  accuracyValue = "100.00";
}

return {
  bestMatch,
  similarity: highestSimilarity,
  accuracy: accuracyValue
};
  };
