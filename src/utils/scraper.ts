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
  
  // Add more popular spirits websites
  'totalwine': {
    selectors: {
      bottleName: '.pdp-name, .product-name, h1',
      bottlePrice: '.price, .pdp-price, span[class*="price"]',
      bottleImage: '.pdp-image img, .product-img img, img[class*="product"], .pdp-img img',
      bottleDetails: {
        brand: '.pdp-details span[data-test="branded-name"], .product-brand, [data-test="product-brand"]',
        type: '.pdp-details .product-info-label:contains("Type") + span, [data-test="product-info--type"], .product-type',
        year: '.pdp-details .product-info-label:contains("Vintage") + span, [data-test="product-info--vintage"], .product-vintage',
        country: '.pdp-details .product-info-label:contains("Country") + span, [data-test="product-info--country"], .product-country',
        region: '.pdp-details .product-info-label:contains("Region") + span, [data-test="product-info--region"], .product-region'
      }
    },
    urlPatterns: ['totalwine.com']
  },
  
  'masterofmalt': {
    selectors: {
      bottleName: '.product-page__name h1',
      bottlePrice: '.product-action-block__price',
      bottleImage: '.product-page__image img',
      bottleDetails: {
        brand: '.product-page__category',
        type: '.product-page__meta dt:contains("Style") + dd',
        year: '.product-page__meta dt:contains("Age") + dd',
        country: '.product-page__meta dt:contains("Country") + dd',
        abv: '.product-page__meta dt:contains("ABV") + dd'
      }
    },
    urlPatterns: ['masterofmalt.com']
  },

  'caskers': {
    selectors: {
      bottleName: '.product-single__title',
      bottlePrice: '.product__price .money',
      bottleImage: '.product-single__photo-wrapper img',
      bottleDetails: {
        brand: '.product-single__vendor',
        type: '.product-single__meta-item:contains("Type")',
        year: '.product-single__meta-item:contains("Age")',
        region: '.product-single__meta-item:contains("Region")'
      }
    },
    urlPatterns: ['caskers.com']
  },

  // Generic selectors that might work on many sites
  'generic': {
    selectors: {
      bottleName: 'h1, .product-title, .product-name, [class*="product-name"], [class*="title"], [class*="product-title"]',
      bottlePrice: '.price, [class*="price"], [id*="price"], .product-price, .current-price, [class*="current-price"]',
      bottleImage: '.product-image img, [class*="product"] img, [class*="main"] img, img[class*="product"], .product-img img',
      bottleDetails: {}
    },
    urlPatterns: ['*']
  }
};

// Helper to extract text content and handle potential null elements
const extractText = (selector: string): string => {
  try {
    // Try multiple elements if selector has commas
    if (selector.includes(',')) {
      const selectors = selector.split(',').map(s => s.trim());
      for (const s of selectors) {
        const element = document.querySelector(s);
        if (element && element.textContent?.trim()) {
          console.log(`Found text with selector: ${s}`);
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

// Helper to extract price as a number from text
const extractPrice = (selector: string): number => {
  try {
    const priceText = extractText(selector);
    console.log(`Extracted price text: "${priceText}" from selector: ${selector}`);
    
    // Extract numeric value from the price string (handle various formats)
    // Strip all non-numeric characters except for the decimal point
    const price = priceText.replace(/[^0-9.]/g, '');
    const parsedPrice = parseFloat(price);
    console.log(`Parsed price: ${parsedPrice} from string: ${price}`);
    
    return parsedPrice || 0;
  } catch (error) {
    console.error(`Error extracting price with selector: ${selector}`, error);
    return 0;
  }
};

// Helper to extract image URL
const extractImageUrl = (selector: string): string => {
  try {
    // Try multiple elements if selector has commas
    if (selector.includes(',')) {
      const selectors = selector.split(',').map(s => s.trim());
      for (const s of selectors) {
        const imgElement = document.querySelector(s) as HTMLImageElement;
        if (imgElement && imgElement.src) {
          console.log(`Found image with selector: ${s}`);
          return imgElement.src;
        }
      }
      return '';
    } else {
      const imgElement = document.querySelector(selector) as HTMLImageElement;
      return imgElement ? imgElement.src : '';
    }
  } catch (error) {
    console.error(`Error extracting image with selector: ${selector}`, error);
    return '';
  }
};

// Match current URL to determine which scraper to use
const getMatchingScraper = (url: string): ScraperConfig | null => {
  const hostname = new URL(url).hostname.toLowerCase();
  console.log(`Looking for scraper config for hostname: ${hostname}`);
  
  for (const [key, config] of Object.entries(scraperConfigs)) {
    if (config.urlPatterns.some(pattern => {
      if (pattern === '*') return true;
      return hostname.includes(pattern);
    })) {
      console.log(`Found matching scraper config: ${key}`);
      return config;
    }
  }
  
  console.log('No matching scraper config found, falling back to generic');
  return scraperConfigs['generic']; // Always return at least the generic scraper
};

// Try different selector combinations to find bottle data
const trySelectors = (selectors: string[]): string => {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent) {
      return element.textContent.trim();
    }
  }
  return '';
};

// Main scraper function
export const scrapeBottleData = (url: string): Bottle | null => {
  console.log(`Scraping bottle data from URL: ${url}`);
  try {
    // Log all elements that might be bottle-related to help with debugging
    console.log(`All h1 elements on page:`, Array.from(document.querySelectorAll('h1')).map(el => el.textContent));
    console.log(`All price elements on page:`, Array.from(document.querySelectorAll('.price, [class*="price"]')).map(el => el.textContent));
    
    const scraperConfig = getMatchingScraper(url);
    
    if (!scraperConfig) {
      console.log('No scraper configuration found for this URL');
      return null; // No matching scraper for this site
    }
    
    const { selectors } = scraperConfig;
    
    // Extract basic bottle information
    console.log(`Using name selector: ${selectors.bottleName}`);
    const name = extractText(selectors.bottleName);
    console.log(`Extracted name: "${name}"`);
    
    const price = extractPrice(selectors.bottlePrice);
    console.log(`Extracted price: ${price}`);
    
    const image = extractImageUrl(selectors.bottleImage);
    console.log(`Extracted image URL: ${image}`);
    
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
    
    console.log('Extracted details:', details);
    
    // Validate that we have at least a name and price
    if (!name) {
      console.log('Failed to extract required bottle name');
      return null;
    }
    
    // If we have a name but no price, try to go with just the name
    const bottleData = {
      name,
      price: price || 0, // Allow zero price in case we only want name matching
      image,
      retailer: new URL(url).hostname,
      url,
      details
    };
    
    console.log('Successfully extracted bottle data:', bottleData);
    return bottleData;
  } catch (error) {
    console.error('Error scraping bottle data:', error);
    return null;
  }
}; 