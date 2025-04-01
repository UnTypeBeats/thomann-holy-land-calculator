/**
 * Content script for the Holy Land Fee Calculator Chrome extension.
 * This script extracts the price of a product from the Thomann.de website,
 * converts it to the local currency (₪), and displays the converted price
 * alongside the original price.
 */

console.log('Holy Land Fee Calculator content script loaded');

function updatePrice() {

    console.log('updatePrice function called');
    const conversionRate = 5.52409202;
    const priceElement = document.querySelector('.price');
    if (!priceElement) {
        console.error('Price element not found');

    } else {
        const euroPriceElement = document.querySelector('.price__secondary');
        if (!euroPriceElement) {
            console.error('Price element not found');
        } else {
            // Extract the price from the element
            console.log('Price element found:', euroPriceElement);
            const euroAmountText = euroPriceElement.textContent.trim()
                .replace('.', '')
                .replace(',', '.')
                .match(/[\d.]+/);
            if (!euroAmountText) {
                console.error('Euro amount not found in price element');
            } else {
                let euroAmountTextElement = euroAmountText[0];
                console.log('Euro amount found:', euroAmountTextElement);
                const euroAmount = parseFloat(euroAmountTextElement);
                const convertedPrice = euroAmount * conversionRate;

                console.log('Converted price:', convertedPrice);
                // Format the converted price to 2 decimal places
                const convertedPriceFormatted = convertedPrice.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                });

                console.log('Converted price formatted:', convertedPriceFormatted);

                // Create a new element for the converted price
                const newPriceElement = document.createElement('span');
                newPriceElement.style.color = 'green';
                newPriceElement.textContent = `${convertedPriceFormatted}`;

                const currencySignElement = document.createElement('span');
                currencySignElement.className = 'price__symbol';
                currencySignElement.textContent = '₪';

                const oldNISPriceElement = document.createElement('span');
                const priceNodeText = priceElement.childNodes[0].nodeValue.trim(); // The text node is typically the first

                oldNISPriceElement.className = 'price__secondary';
                oldNISPriceElement.textContent = `${priceNodeText}₪`;

                currencySignElement.style.color = 'green';
                oldNISPriceElement.style.color = 'gray';
                euroPriceElement.style.color = 'gray';

                console.log('New price element created:', newPriceElement);
                console.log('New price element created:', euroPriceElement);
                console.log('New price element created:', oldNISPriceElement);

                // Insert new element after existing price element
                euroPriceElement.parentNode.insertBefore(newPriceElement, euroPriceElement.nextSibling);
                priceElement.replaceChildren(newPriceElement, euroPriceElement, oldNISPriceElement);
            }
        }
    }
}

// Initial run for loaded content
updatePrice();

