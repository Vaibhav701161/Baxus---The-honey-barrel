import { scrapeBottleData } from '../utils/scraper';
import { Message } from '../types';

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  if (message.type === 'SCRAPE_BOTTLE') {
    // Get the current URL
    const currentUrl = window.location.href;
    
    // Scrape bottle data from the current page
    const bottleData = scrapeBottleData(currentUrl);
    
    // Send the bottle data back
    sendResponse({
      type: 'BOTTLE_DATA',
      data: bottleData
    });
    
    // If bottle data was found, send it to the background script
    if (bottleData) {
      chrome.runtime.sendMessage({
        type: 'MATCH_BOTTLE',
        data: bottleData
      });
    }
  }
  
  // Return true to indicate we'll respond asynchronously
  return true;
});

// Automatically detect bottle data when the page loads
window.addEventListener('load', () => {
  const currentUrl = window.location.href;
  const bottleData = scrapeBottleData(currentUrl);
  
  // If bottle data was found, send it to the background script
  if (bottleData) {
    chrome.runtime.sendMessage({
      type: 'MATCH_BOTTLE',
      data: bottleData
    });
  }
}); 