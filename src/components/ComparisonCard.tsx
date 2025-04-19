import React from 'react';
import { motion } from 'framer-motion';
import { Comparison } from '../types';

interface ComparisonCardProps {
  comparison: Comparison;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ comparison }) => {
  const { bottle, baxusListing, savings, savingsPercentage } = comparison;
  
  return (
    <motion.div 
      className="card mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        {/* Bottle image */}
        <div className="w-24 h-24 mr-4 relative flex-shrink-0">
          {baxusListing.image ? (
            <img 
              src={baxusListing.image} 
              alt={baxusListing.name} 
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="w-full h-full bg-luxury-dark flex items-center justify-center rounded">
              <span className="text-luxury-gold text-3xl">🥃</span>
            </div>
          )}
        </div>
        
        {/* Bottle details */}
        <div className="flex-1">
          <h3 className="text-lg font-playfair font-semibold text-luxury-gold mb-1">
            {baxusListing.name}
          </h3>
          
          <div className="text-sm mb-2 text-luxury-cream/80">
            {baxusListing.details?.brand && (
              <span className="block">{baxusListing.details.brand}</span>
            )}
            {baxusListing.details?.year && (
              <span className="block">{baxusListing.details.year}</span>
            )}
          </div>
          
          {/* Price comparison */}
          <div className="flex items-center mt-2">
            <div className="mr-4">
              <div className="text-xs text-luxury-cream/60">Retail Price:</div>
              <div className="text-luxury-cream line-through">${bottle.price.toFixed(2)}</div>
            </div>
            
            <div className="mr-4">
              <div className="text-xs text-luxury-cream/60">BAXUS Price:</div>
              <div className="text-luxury-gold font-semibold">${baxusListing.price.toFixed(2)}</div>
            </div>
            
            <div className="ml-auto">
              <span className="savings-badge flex items-center">
                Save ${savings.toFixed(2)} ({savingsPercentage.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer with link to BAXUS */}
      <div className="mt-3 pt-3 border-t border-luxury-gold/10 flex justify-between items-center">
        <div className="text-xs text-luxury-cream/60">
          Retailer: {bottle.retailer}
        </div>
        <a 
          href={baxusListing.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-primary text-sm py-1"
        >
          View on BAXUS
        </a>
      </div>
    </motion.div>
  );
};

export default ComparisonCard; 