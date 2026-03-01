export const euclideanDistance = (vecA, vecB) => {
  if (!vecA || !vecB) return 999;
  if (vecA.length !== vecB.length) return 999;

  return Math.sqrt(
    vecA.reduce((sum, val, i) => {
      const diff = val - vecB[i];
      return sum + diff * diff;
    }, 0)
  );
};