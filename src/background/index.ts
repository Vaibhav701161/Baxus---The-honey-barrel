import { Bottle, Message, Comparison } from '../types';
import { searchListings } from '../utils/api';
import { findMatchingBottles } from '../utils/fuzzyMatch';

// Store the current comparison results
let currentResults: Comparison[] = [];

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  if (message.type === 'MATCH_BOTTLE') {
    const bottle: Bottle = message.data;
    
    // Use the bottle name to search BAXUS marketplace
    searchListings(bottle.name)
      .then(baxusListings => {
        // Find matching bottles and calculate savings
        const matchResults = findMatchingBottles(bottle, baxusListings);
        
        // Store results
        currentResults = matchResults;
        
        // Send the results back to the popup (if open)
        chrome.runtime.sendMessage({
          type: 'MATCHING_RESULTS',
          data: matchResults
        });
        
        // Update badge if there are matches with savings
        if (matchResults.length > 0) {
          chrome.action.setBadgeText({ text: matchResults.length.toString() });
          chrome.action.setBadgeBackgroundColor({ color: '#D4AF37' });
        } else {
          chrome.action.setBadgeText({ text: '' });
        }
      })
      .catch(error => {
        console.error('Error matching bottle:', error);
      });
      
    // Return true to indicate we'll respond asynchronously
    return true;
  }
  
  // If popup is requesting current results
  if (message.type === 'GET_RESULTS') {
    sendResponse({
      type: 'MATCHING_RESULTS',
      data: currentResults
    });
    return true;
  }
});

// When the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Clear badge
  chrome.action.setBadgeText({ text: '' });
  
  // Initialize storage
  chrome.storage.local.set({ savedComparisons: [] });
}); 