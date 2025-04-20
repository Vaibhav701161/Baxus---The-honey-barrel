import React, { useEffect, useState } from 'react';
import { Comparison, Message } from '../types';
import Header from '../components/Header';
import ComparisonCard from '../components/ComparisonCard';
import EmptyState from '../components/EmptyState';

const App: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'no-bottle' | 'no-matches' | 'has-matches' | 'error'>('loading');
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  useEffect(() => {
    console.log('[Popup] Initializing popup component');
    
    // Request current tab info
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      console.log('[Popup] Current tab:', currentTab);
      
      if (!currentTab || !currentTab.id) {
        console.log('[Popup] No active tab found');
        setStatus('error');
        setErrorMessage('No active tab detected');
        return;
      }
      
      // Try to scrape the page directly using scripting API
      console.log('[Popup] Attempting to scrape page using scripting API');
      try {
        // Check for undefined tabId
        if (typeof currentTab.id !== 'number') {
          console.error('[Popup] Tab ID is not a number');
          setStatus('error');
          setErrorMessage('Invalid Tab ID');
          return;
        }
        
        const tabId: number = currentTab.id;
        
        // Use the scripting API to execute script in the tab
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            // Scrape bottle data directly in the current page context
            console.log('[Injection] Scraping page content directly');
            
            // Helper to extract text content
            const extractText = (selector: string): string => {
              try {
                if (selector.includes(',')) {
                  const selectors = selector.split(',').map(s => s.trim());
                  for (const s of selectors) {
                    const element = document.querySelector(s);
                    if (element && element.textContent?.trim()) {
                      return element.textContent.trim() || '';
                    }
                  }
                  return '';
                } else {
                  const element = document.querySelector(selector);
                  return element ? element.textContent?.trim() || '' : '';
                }
              } catch (error) {
                console.error(`Error extracting text with selector: ${selector}`, error);
                return '';
              }
            };
            
            // Extract price as number
            const extractPrice = (selector: string): number => {
              try {
                const priceText = extractText(selector);
                const price = priceText.replace(/[^0-9.]/g, '');
                const parsedPrice = parseFloat(price);
                return parsedPrice || 0;
              } catch (error) {
                return 0;
              }
            };
            
            // Extract image URL
            const extractImageUrl = (selector: string): string => {
              try {
                if (selector.includes(',')) {
                  const selectors = selector.split(',').map(s => s.trim());
                  for (const s of selectors) {
                    const imgElement = document.querySelector(s) as HTMLImageElement;
                    if (imgElement && imgElement.src) {
                      return imgElement.src;
                    }
                  }
                  return '';
                } else {
                  const imgElement = document.querySelector(selector) as HTMLImageElement;
                  return imgElement ? imgElement.src : '';
                }
              } catch (error) {
                return '';
              }
            };
            
            // Try common selectors for different websites
            const selectors = {
              bottleName: 'h1, .product-title, .product-name, [class*="product-name"], .pdp-name',
              bottlePrice: '.price, [class*="price"], [id*="price"], .product-price',
              bottleImage: '.product-image img, [class*="product"] img, .pdp-image img'
            };
            
            // Extract data
            const name = extractText(selectors.bottleName);
            const price = extractPrice(selectors.bottlePrice);
            const image = extractImageUrl(selectors.bottleImage);
            
            console.log('[Injection] Extracted data:', { name, price, image });
            
            // Return the data to the caller
            return {
              name,
              price,
              image,
              retailer: window.location.hostname,
              url: window.location.href,
              details: {}
            };
          },
        }, 
        (results) => {
          const lastError = chrome.runtime.lastError;
          if (lastError) {
            console.error('[Popup] Scripting execution error:', lastError);
            setStatus('error');
            setErrorMessage(`Script injection failed: ${lastError.message}`);
            return;
          }
          
          if (!results || results.length === 0 || !results[0].result) {
            console.log('[Popup] No results from script execution');
            setStatus('no-bottle');
            return;
          }
          
          const bottleData = results[0].result;
          console.log('[Popup] Bottle data from scripting:', bottleData);
          
          if (!bottleData.name) {
            console.log('[Popup] No bottle name found');
            setStatus('no-bottle');
            return;
          }
          
          // Send the bottle data to the background script for matching
          console.log('[Popup] Sending bottle data to background script for matching');
          chrome.runtime.sendMessage({ type: 'MATCH_BOTTLE', data: bottleData } as Message, (response) => {
            const bgLastError = chrome.runtime.lastError;
            if (bgLastError) {
              // If the background script didn't respond, it might still process the message later
              // So, we'll just wait for the MATCHING_RESULTS message
              console.warn('[Popup] Background script might be inactive, waiting for results message...', bgLastError);
            }
          });
          
          // Set a timeout for API response
          const timeout = setTimeout(() => {
            console.log('[Popup] Timeout waiting for matches, showing no-matches state');
            setStatus('no-matches');
          }, 7000); // Increased timeout
          
          // Listen for matching results
          const messageListener = (message: Message) => {
            if (message.type === 'MATCHING_RESULTS') {
              clearTimeout(timeout);
              
              if (message.data && message.data.length > 0) {
                console.log('[Popup] Received matching results:', message.data);
                setComparisons(message.data);
                setStatus('has-matches');
              } else {
                console.log('[Popup] No matches found');
                setStatus('no-matches');
              }
            }
          };
          
          chrome.runtime.onMessage.addListener(messageListener);
          
          return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
            clearTimeout(timeout);
          };
        });
      } catch (error) {
        console.error('[Popup] Exception in scripting execution:', error);
        setStatus('error');
        setErrorMessage(`An unexpected error occurred: ${error}`);
      }
    });
  }, []);
  
  return (
    <div className="w-96 max-h-[600px] overflow-hidden flex flex-col">
      <Header />
      
      <div className="overflow-y-auto flex-1 p-4">
        {status === 'loading' && <EmptyState type="loading" />}
        {status === 'no-bottle' && <EmptyState type="no-bottle" />}
        {status === 'no-matches' && <EmptyState type="no-matches" />}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="font-playfair text-xl text-red-500 mb-2">Extension Error</h3>
            <p className="text-luxury-cream/70 text-sm max-w-xs">
              {errorMessage || "There was a problem with the extension. Try reloading the page or reinstalling the extension."}
            </p>
          </div>
        )}
        
        {status === 'has-matches' && (
          <>
            <h2 className="font-playfair text-lg mb-3 text-luxury-cream">
              Found {comparisons.length} better deal{comparisons.length !== 1 ? 's' : ''}:
            </h2>
            
            {comparisons.map((comparison, index) => (
              <ComparisonCard 
                key={comparison.baxusListing.id || index} 
                comparison={comparison} 
              />
            ))}
          </>
        )}
      </div>
      
      <div className="p-2 border-t border-luxury-gold/10 bg-luxury-dark text-xs text-center text-luxury-cream/40">
        Prices updated every 24 hours
      </div>
    </div>
  );
};

export default App;