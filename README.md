# The Honey Barrel Chrome Extension

A full-featured Chrome extension built with React and Manifest V3, designed to scrape whisky/wine bottle data from retail websites and cross-reference it with the BAXUS marketplace API to detect better deals.

## Features

- **Bottle Detection & Scraping**: Automatically detects whisky/wine bottle names, details, and prices from popular retail sites.
- **BAXUS Marketplace Matching**: Uses fuzzy matching to find better deals on BAXUS.
- **Elegant UI**: Beautiful, non-intrusive popup with a luxury design aesthetic.
- **Savings Calculator**: Shows how much you could save by buying on BAXUS instead.

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn

### Installation & Development

1. Clone the repository:
```
git clone https://github.com/yourusername/the-honey-barrel.git
cd the-honey-barrel
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top-right corner)
   - Click "Load unpacked" and select the `dist` folder from this project

### Building for Production

```
npm run build
```

This will create a production-ready extension in the `dist` folder, which you can zip and upload to the Chrome Web Store.

## Adding Support for New Retail Sites

To add support for a new retail website, edit the `src/utils/scraper.ts` file and add a new entry to the `scraperConfigs` object:

```typescript
'new-site-key': {
  selectors: {
    bottleName: '.css-selector-for-bottle-name',
    bottlePrice: '.css-selector-for-bottle-price',
    bottleImage: '.css-selector-for-bottle-image',
    bottleDetails: {
      // Optional selectors for additional details
      brand: '.css-selector-for-brand',
      // ...
    }
  },
  urlPatterns: ['example.com', 'www.example.com']
},
```

## Tech Stack

- **React**: For building the UI
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling with a custom luxury theme
- **Fuse.js**: For fuzzy matching
- **Framer Motion**: For animations and transitions
- **Axios**: For API requests

## License

ISC