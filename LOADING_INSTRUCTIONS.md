# Loading The Honey Barrel Extension in Chrome

Follow these steps to load the extension in developer mode:

1. Open Chrome and navigate to: `chrome://extensions/`

2. Enable "Developer mode" by toggling the switch in the top right corner

3. Click the "Load unpacked" button

4. Select the `dist` folder in this project

5. The extension should now be loaded and visible in your browser toolbar

## Usage

1. Visit a supported wine or whisky retail website (like whiskyexchange.com or wine.com)

2. Navigate to a product page with a bottle

3. The extension icon should show a badge number if better deals were found

4. Click the extension icon to see comparison results with BAXUS marketplace

## Troubleshooting

If you encounter any issues:

- Make sure you've built the extension with `npm run build`
- Check the browser console for any error messages
- Try reloading the extension from the extensions page
- Visit a supported retailer website with bottle listings

## Adding More Retail Sites

To add support for additional retail websites:

1. Edit `src/utils/scraper.ts`
2. Add a new entry to the `scraperConfigs` object with selectors
3. Rebuild the extension with `npm run build`
4. Reload the extension in Chrome 