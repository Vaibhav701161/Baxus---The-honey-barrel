import React, { useEffect, useState } from 'react';
import { Comparison, Message } from '../types';
import Header from '../components/Header';
import ComparisonCard from '../components/ComparisonCard';
import EmptyState from '../components/EmptyState';

const App: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'no-bottle' | 'no-matches' | 'has-matches'>('loading');
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  
  useEffect(() => {
    // Request current tab info
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      
      if (!currentTab) {
        setStatus('no-bottle');
        return;
      }
      
      // Check if there are already results in background script
      chrome.runtime.sendMessage({ type: 'GET_RESULTS' } as Message, (response: Message) => {
        if (response && response.data && response.data.length > 0) {
          setComparisons(response.data);
          setStatus('has-matches');
          return;
        }
        
        // If no results, try to scrape the page
        chrome.tabs.sendMessage(currentTab.id!, { type: 'SCRAPE_BOTTLE' } as Message, (response: Message) => {
          // If we couldn't get bottle data, show no-bottle state
          if (!response || !response.data) {
            setStatus('no-bottle');
            return;
          }
          
          // Set a timeout for API response
          const timeout = setTimeout(() => {
            // After 5 seconds, if we still don't have matches, show no-matches state
            setStatus('no-matches');
          }, 5000);
          
          // Listen for matching results
          const messageListener = (message: Message) => {
            if (message.type === 'MATCHING_RESULTS') {
              clearTimeout(timeout);
              
              if (message.data && message.data.length > 0) {
                setComparisons(message.data);
                setStatus('has-matches');
              } else {
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
      });
    });
  }, []);
  
  return (
    <div className="w-96 max-h-[600px] overflow-hidden flex flex-col">
      <Header />
      
      <div className="overflow-y-auto flex-1 p-4">
        {status === 'loading' && <EmptyState type="loading" />}
        {status === 'no-bottle' && <EmptyState type="no-bottle" />}
        {status === 'no-matches' && <EmptyState type="no-matches" />}
        
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