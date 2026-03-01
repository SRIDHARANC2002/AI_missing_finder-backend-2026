import { cosineSimilarity } from "../utils/similarityCalculator.js";

export const findTopMatches = (unknownEmbedding, complaints, limit = 5) => {
  const matches = complaints
    .filter((c) => c.faceEmbedding && c.faceEmbedding.length > 0)
    .map((complaint) => {
      try {
        const score = cosineSimilarity(unknownEmbedding, complaint.faceEmbedding);
        return { complaint, score };
      } catch (err) {
        console.error(`Similarity error for ${complaint._id}:`, err.message);
        return { complaint, score: 0 };
      }
    });

  // Sort by score descending and return top results
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

// Keep old function for compatibility if needed, but return top 1
export const findBestMatch = (unknownEmbedding, complaints) => {
  const top = findTopMatches(unknownEmbedding, complaints, 1);
  return top.length > 0 ? { bestMatch: top[0].complaint, highestScore: top[0].score } : { bestMatch: null, highestScore: 0 };
};