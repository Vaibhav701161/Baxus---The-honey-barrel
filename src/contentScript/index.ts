import { scrapeBottleData } from '../utils/scraper';
import { Message } from '../types';

// Helper function to log for debugging
const debug = (message: string, data?: any) => {
  console.log(`[Honey Barrel Extension] ${message}`, data || '');
};

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  debug('Received message in content script:', message);
  
  if (message.type === 'SCRAPE_BOTTLE') {
    debug('Scraping bottle data from current page');
    
    try {
      // Get the current URL
      const currentUrl = window.location.href;
      debug('Current URL:', currentUrl);
      
      // Scrape bottle data from the current page
      const bottleData = scrapeBottleData(currentUrl);
      debug('Scraped bottle data:', bottleData);
      
      // Send the bottle data back
      sendResponse({
        type: 'BOTTLE_DATA',
        data: bottleData
      });
      
      // If bottle data was found, send it to the background script
      if (bottleData) {
        debug('Sending scraped bottle data to background script');
        chrome.runtime.sendMessage({
          type: 'MATCH_BOTTLE',
          data: bottleData
        });
      } else {
        debug('No bottle data found on page');
      }
    } catch (error: any) {
      debug('Error scraping bottle data:', error);
      sendResponse({
        type: 'BOTTLE_DATA',
        data: null,
        error: error.message || String(error)
      });
    }
  }
  
  // Return true to indicate we'll respond asynchronously
  return true;
});

// Automatically detect bottle data when the page loads
window.addEventListener('load', () => {
  debug('Page loaded, automatically detecting bottle data');
  
  try {
    const currentUrl = window.location.href;
    const bottleData = scrapeBottleData(currentUrl);
    
    // If bottle data was found, send it to the background script
    if (bottleData) {
      debug('Auto-detected bottle data, sending to background:', bottleData);
      chrome.runtime.sendMessage({
        type: 'MATCH_BOTTLE',
        data: bottleData
      });
    } else {
      debug('No bottle data auto-detected on the page');
    }
  } catch (error: any) {
    debug('Error auto-detecting bottle data:', error);
  }
});

// Notify that content script has been loaded
debug('Content script loaded successfully'); 