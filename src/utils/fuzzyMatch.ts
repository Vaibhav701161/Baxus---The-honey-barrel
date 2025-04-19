import Fuse from 'fuse.js';
import { Bottle, BaxusListing, Comparison } from '../types';

// Configure Fuse.js options for fuzzy matching
const fuseOptions = {
  includeScore: true,
  keys: ['name'],
  threshold: 0.4,  // Lower values = more strict matching
  distance: 100    // How far to search for matching characters
};

export const findMatchingBottles = (bottle: Bottle, baxusListings: BaxusListing[]): Comparison[] => {
  // Create a Fuse instance with the BAXUS listings
  const fuse = new Fuse(baxusListings, fuseOptions);
  
  // Perform the search for matches
  const results = fuse.search(bottle.name);
  
  // Transform results into Comparison objects
  return results
    .filter(result => result.score !== undefined && result.score < 0.4) // Only keep good matches
    .map(result => {
      const baxusListing = result.item;
      const savings = bottle.price - baxusListing.price;
      const savingsPercentage = (savings / bottle.price) * 100;
      
      return {
        bottle,
        baxusListing,
        savings,
        savingsPercentage
      };
    })
    .filter(comparison => comparison.savings > 0) // Only keep comparisons with actual savings
    .sort((a, b) => b.savings - a.savings); // Sort by highest savings first
}; 