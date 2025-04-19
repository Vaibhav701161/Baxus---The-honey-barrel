import axios from 'axios';
import { BaxusListing } from '../types';

const API_BASE_URL = 'https://services.baxus.co/api';

export const searchListings = async (query: string): Promise<BaxusListing[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search/listings`, {
      params: {
        from: 0,
        size: 20,
        listed: true,
        query
      }
    });
    
    // Transform the response data to match our BaxusListing interface
    return response.data.hits.map((hit: any) => ({
      id: hit._id,
      name: hit._source.title,
      price: hit._source.price,
      image: hit._source.image_url || undefined,
      url: `https://baxus.co/listing/${hit._id}`,
      details: {
        brand: hit._source.brand,
        type: hit._source.type,
        year: hit._source.year,
        country: hit._source.country,
        region: hit._source.region,
        abv: hit._source.abv_percentage
      }
    }));
  } catch (error) {
    console.error('Error searching BAXUS listings:', error);
    return [];
  }
}; 