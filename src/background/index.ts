import { Bottle, Message, Comparison } from '../types';
import { searchListings } from '../utils/api';
import { findMatchingBottles } from '../utils/fuzzyMatch';

// Helper function to log for debugging
const debug = (message: string, data?: any) => {
  console.log(`[Honey Barrel Background] ${message}`, data || '');
};

// Store the current comparison results
let currentResults: Comparison[] = [];

debug('Background script initialized');

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  debug('Received message in background script:', message);
  
  if (message.type === 'MATCH_BOTTLE') {
    const bottle: Bottle = message.data;
    debug('Matching bottle against BAXUS listings:', bottle);
    
    // Use the bottle name to search BAXUS marketplace
    searchListings(bottle.name)
      .then(baxusListings => {
        debug(`Received ${baxusListings.length} BAXUS listings for search:`, bottle.name);
        
        // Find matching bottles and calculate savings
        const matchResults = findMatchingBottles(bottle, baxusListings);
        debug(`Found ${matchResults.length} matches with savings:`, matchResults);
        
        // Store results
        currentResults = matchResults;
        
        // Send the results back to the popup (if open)
        debug('Sending matching results to popup');
        chrome.runtime.sendMessage({
          type: 'MATCHING_RESULTS',
          data: matchResults
        });
        
        // Update badge if there are matches with savings
        if (matchResults.length > 0) {
          chrome.action.setBadgeText({ text: matchResults.length.toString() });
          chrome.action.setBadgeBackgroundColor({ color: '#D4AF37' });
          debug(`Updated badge to show ${matchResults.length} matches`);
        } else {
          chrome.action.setBadgeText({ text: '' });
          debug('Cleared badge (no matches)');
        }
      })
      .catch(error => {
        console.error('Error matching bottle:', error);
        debug('Error matching bottle:', error);
        
        // Still send a response even if there's an error
        chrome.runtime.sendMessage({
          type: 'MATCHING_RESULTS',
          data: [],
          error: error.message || String(error)
        });
      });
      
    // Return true to indicate we'll respond asynchronously
    return true;
  }
  
  // If popup is requesting current results
  if (message.type === 'GET_RESULTS') {
    debug('Popup requested current results, sending:', currentResults);
    sendResponse({
      type: 'MATCHING_RESULTS',
      data: currentResults
    });
    return true;
  }
});

// When the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  debug('Extension installed or updated');
  
  // Clear badge
  chrome.action.setBadgeText({ text: '' });
  
  // Initialize storage
  chrome.storage.local.set({ savedComparisons: [] });
}); 