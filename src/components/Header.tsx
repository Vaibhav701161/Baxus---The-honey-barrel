import React from 'react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  return (
    <motion.div 
      className="px-4 py-3 border-b border-luxury-gold/10 flex items-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-3xl mr-2">🍯</div>
      <div>
        <h1 className="font-playfair text-xl font-bold text-luxury-gold">The Honey Barrel</h1>
        <p className="text-xs text-luxury-cream/60">Find the best deals on BAXUS</p>
      </div>
    </motion.div>
  );
};

export default Header; 