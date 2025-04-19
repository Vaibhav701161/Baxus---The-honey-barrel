import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  type: 'loading' | 'no-bottle' | 'no-matches';
}

const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  let icon = '🔍';
  let title = 'Looking for bottles';
  let message = 'Please wait while we scan the page...';
  
  if (type === 'no-bottle') {
    icon = '🥃';
    title = 'No Bottle Detected';
    message = 'Visit a spirits retailer page with a bottle to compare prices.';
  } else if (type === 'no-matches') {
    icon = '💸';
    title = 'No Better Deals Found';
    message = 'We couldn\'t find any better deals for this bottle on BAXUS.';
  }
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-8 px-4 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-playfair text-xl text-luxury-gold mb-2">{title}</h3>
      <p className="text-luxury-cream/70 text-sm max-w-xs">{message}</p>
      
      {type === 'loading' && (
        <div className="mt-4 relative w-24 h-1 bg-luxury-dark overflow-hidden rounded-full">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-luxury-gold"
            initial={{ width: '0%' }}
            animate={{ 
              width: ['0%', '100%', '0%'],
              left: ['0%', '0%', '100%'],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              ease: "easeInOut"
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState; 