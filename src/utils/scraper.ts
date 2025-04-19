import { Bottle, ScraperConfig } from '../types';

// Site-specific scrapers
const scraperConfigs: Record<string, ScraperConfig> = {
  // Example for a whisky retail site
  'whiskyexchange': {
    selectors: {
      bottleName: '.product-main__name',
      bottlePrice: '.product-action__price',
      bottleImage: '.product-main__image img',
      bottleDetails: {
        brand: '.product-main__subtitle',
        type: '.product-main__data-item:nth-child(1)',
        year: '.product-main__data-item:nth-child(2)',
        country: '.product-main__data-item:nth-child(3)',
        abv: '.product-main__data-item:nth-child(4)'
      }
    },
    urlPatterns: ['thewhiskyexchange.com', 'whiskyexchange.com']
  },
  
  // Example for a wine retail site
  'wine.com': {
    selectors: {
      bottleName: '.pipName',
      bottlePrice: '.productPrice .price',
      bottleImage: '.pipImgCarousel img',
      bottleDetails: {
        brand: '.pipWinery',
        type: '.pipClassifications li:nth-child(1)',
        year: '.pipVintage',
        region: '.pipRegion'
      }
    },
    urlPatterns: ['wine.com']
  },
  
  // Add more site-specific configurations as needed
};

// Helper to extract text content and handle potential null elements
const extractText = (selector: string): string => {
  const element = document.querySelector(selector);
  return element ? element.textContent?.trim() || '' : '';
};

// Helper to extract price as a number from text
const extractPrice = (selector: string): number => {
  const priceText = extractText(selector);
  // Extract numeric value from the price string (handle various formats)
  const price = priceText.replace(/[^0-9.]/g, '');
  return parseFloat(price) || 0;
};

// Helper to extract image URL
const extractImageUrl = (selector: string): string => {
  const imgElement = document.querySelector(selector) as HTMLImageElement;
  return imgElement ? imgElement.src : '';
};

// Match current URL to determine which scraper to use
const getMatchingScraper = (url: string): ScraperConfig | null => {
  const hostname = new URL(url).hostname.toLowerCase();
  
  for (const [key, config] of Object.entries(scraperConfigs)) {
    if (config.urlPatterns.some(pattern => hostname.includes(pattern))) {
      return config;
    }
  }
  
  return null;
};

// Main scraper function
export const scrapeBottleData = (url: string): Bottle | null => {
  const scraperConfig = getMatchingScraper(url);
  
  if (!scraperConfig) {
    return null; // No matching scraper for this site
  }
  
  const { selectors } = scraperConfig;
  
  // Extract basic bottle information
  const name = extractText(selectors.bottleName);
  const price = extractPrice(selectors.bottlePrice);
  const image = extractImageUrl(selectors.bottleImage);
  
  // Extract details if available
  const details: Bottle['details'] = {};
  
  if (selectors.bottleDetails) {
    if (selectors.bottleDetails.brand) details.brand = extractText(selectors.bottleDetails.brand);
    if (selectors.bottleDetails.type) details.type = extractText(selectors.bottleDetails.type);
    if (selectors.bottleDetails.year) details.year = extractText(selectors.bottleDetails.year);
    if (selectors.bottleDetails.country) details.country = extractText(selectors.bottleDetails.country);
    if (selectors.bottleDetails.region) details.region = extractText(selectors.bottleDetails.region);
    if (selectors.bottleDetails.abv) details.abv = extractText(selectors.bottleDetails.abv);
  }
  
  // Validate that we have at least a name and price
  if (!name || !price) {
    return null;
  }
  
  return {
    name,
    price,
    image,
    retailer: new URL(url).hostname,
    url,
    details
  };
}; 