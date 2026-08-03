import { Category, UserProfile, MOCK_USERS, MOCK_PRODUCTS } from '../data/data';

export interface MatchingResult {
  twinCohort: UserProfile[];
  recommendedCategories: {
    category: Category;
    adoptionRate: number; // Percentage of twins who buy this
    sampleProducts: {id: number, name: string, price: number, emoji: string}[];
  }[];
}

/**
 * Calculates similarity score between two users.
 * Weights:
 * - Household Type match: 40%
 * - Order Frequency match: 30%
 * - Category Overlap (Jaccard Index): 30%
 */
export function calculateSimilarity(userA: UserProfile, userB: UserProfile): number {
  let score = 0;
  
  if (userA.householdType === userB.householdType) score += 40;
  if (userA.orderFrequency === userB.orderFrequency) score += 30;
  
  // Jaccard index for category overlap
  const setA = new Set(userA.categoriesPurchased);
  const setB = new Set(userB.categoriesPurchased);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  const overlapScore = (intersection.size / union.size) * 30;
  score += overlapScore;
  
  return score;
}

/**
 * Finds the Basket Twins and recommends categories.
 */
export function getBasketTwins(currentUser: UserProfile): MatchingResult {
  const others = MOCK_USERS.filter(u => u.id !== currentUser.id);
  
  // Score all others
  const scored = others.map(u => ({
    user: u,
    score: calculateSimilarity(currentUser, u)
  }));
  
  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  
  // Top 5 most similar users form the "Twin Cohort"
  const twinCohort = scored.slice(0, 5).map(s => s.user);
  
  // Aggregate categories bought by the twin cohort
  const categoryCounts: Record<string, number> = {};
  twinCohort.forEach(twin => {
    twin.categoriesPurchased.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  });
  
  // Filter out categories the current user already buys
  const currentCategories = new Set(currentUser.categoriesPurchased);
  
  const recommendedCategories = Object.entries(categoryCounts)
    .filter(([cat]) => !currentCategories.has(cat as Category))
    .map(([cat, count]) => {
      const adoptionRate = Math.round((count / twinCohort.length) * 100);
      return {
        category: cat as Category,
        adoptionRate,
        sampleProducts: MOCK_PRODUCTS[cat as Category] || []
      };
    })
    .sort((a, b) => b.adoptionRate - a.adoptionRate);
  
  return {
    twinCohort,
    recommendedCategories
  };
}
