export interface Bottle {
  name: string;
  price: number;
  image?: string;
  retailer: string;
  url: string;
  details?: {
    brand?: string;
    type?: string;
    year?: string;
    country?: string;
    region?: string;
    abv?: string;
  };
}

export interface BaxusListing {
  id: string;
  name: string;
  price: number;
  image?: string;
  url: string;
  details?: {
    brand?: string;
    type?: string;
    year?: string;
    country?: string;
    region?: string;
    abv?: string;
  };
}

export interface Comparison {
  bottle: Bottle;
  baxusListing: BaxusListing;
  savings: number;
  savingsPercentage: number;
}

export interface ScraperConfig {
  selectors: {
    bottleName: string;
    bottlePrice: string;
    bottleImage: string;
    bottleDetails?: {
      brand?: string;
      type?: string;
      year?: string;
      country?: string;
      region?: string;
      abv?: string;
    };
  };
  urlPatterns: string[];
}

export interface Message {
  type: 'SCRAPE_BOTTLE' | 'BOTTLE_DATA' | 'MATCH_BOTTLE' | 'MATCHING_RESULTS' | 'GET_RESULTS';
  data?: any;
} 