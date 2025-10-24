/**
 * Content script for the Holy Land Fee Calculator Chrome extension.
 * This script extracts the price of a product from the Thomann.de website,
 * converts it to the local currency (₪), and displays the converted price
 * alongside the original price.
 */

console.log('Holy Land Fee Calculator content script loaded');

const avgOrderValue = 1010.75; // Average order value in Eur
const MAM = 0.18; // Holy Land VAT percentage
const DELIVERY_FEE = 130; // Fixed delivery fee in NIS for using UPS as a courier
const customsFee = 150; // Customs fee the highest value
const customsLowFee = 120; // Customs fee the lowest value
const API_KEY = '32cc555cf69faf942bc3777a'; // ExchangeRate API key

/**
 * Calculates the Holy Land Fee for a given initial price.
 * The fee is 18% of the initial price plus a fixed amount:
 * - 50 if the initial price is less than 1000
 * - 75 if the initial price is 1000 or more
 *
 * @param {number} initialPrice - The initial price of the product.
 * @returns {number} - The total price including the Holy Land Fee.
 */
function calculateHolyLandFee(initialPrice) {
    const partialFee = initialPrice / avgOrderValue;
    const baseFeePreVat = initialPrice < 1000 ? customsLowFee : customsFee; // Fee *before* VAT
    const feeBeforeVat = initialPrice + baseFeePreVat * partialFee + DELIVERY_FEE * partialFee; // Sum before VAT
    const vatAmount = feeBeforeVat * MAM;
    return feeBeforeVat + vatAmount;
}

function calculate() {
    const priceEur = parseFloat(document.getElementById('priceEur').value) || 0;
    const rate = parseFloat(document.getElementById('rate').value) || 0;
    const delivery = parseFloat(document.getElementById('delivery').value) || 0;
    const fixedFees = parseFloat(document.getElementById('fixedFees').value) || 0;
    const vat = parseFloat(document.getElementById('vat').value) || 18;

    const priceIls = priceEur * rate;
    const cifValue = priceIls + delivery;
    const vatAmount = cifValue * (vat / 100);
    const total = vatAmount + fixedFees;

    document.getElementById('output').innerHTML = `
        <p>Стоимость в ₪: ${priceIls.toFixed(2)}</p>
        <p>Стоимость с доставкой (CIF): ${cifValue.toFixed(2)} ₪</p>
        <p>НДС (${vat}%): ${vatAmount.toFixed(2)} ₪</p>
        <p>Фиксированные сборы: ${fixedFees.toFixed(2)} ₪</p>
        <p><strong>Итого к оплате: ${total.toFixed(2)} ₪</strong></p>
      `;
}

/**
 * Fetches the conversion rate from NIS to EUR using the ExchangeRate API.
 * @returns {Promise<*>}
 */

async function getConversionRate() {
    const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/ILS`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        const rateToEur = data.conversion_rates['EUR'];

        console.log(`1 NIS to EUR: ${rateToEur}`);
        return 1 / rateToEur;
    } catch (error) {
        console.error('Error fetching the conversion rate:', error);
    }
}

/**
 * Replaces the price div with a new structure that includes the price in different currencies.
 * @param {Array} priceData - An array of objects containing the price and currency.
 * @returns {void}
 *
 *  */
function replaceDivs(priceData) {
    const priceDiv = document.querySelector('.price');
    const productPriceBox = priceDiv.closest('.product-price-box');

// Create style element and append it to the head
    const style = document.createElement('style');
    style.textContent = `
        .price {
            display: flex;
            flex-direction: column;
            width: 100%;
        }
        .price-row {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            align-self: stretch;
        }
        .price-amount, .price-currency {
            text-align: right;
            margin-left: 5px;
            align-items: flex-end; /* Align row items to the bottom */
        }
        .price-row:first-child .price-amount {
            font-size: 1.1em;
            font-weight: bold;
            line-height: 1.3em; /* Adjusted line height */
            color: green;
        }
        .price-row:first-child .price-currency {
            font-size: 0.4em; /* Fixed size, same as other currency symbols */
            font-weight: 300;
            color: green;
        }
        .price-row:not(:first-child) .price-amount {
            color: grey;
            font-weight: 300;
            line-height: 0.5em; /* Adjusted line height */
            font-size: 0.6em; /* Default size for amounts */
        }
        .price-row:not(:first-child) .price-currency {
            color: grey;
            font-weight: 300;
            font-size: 0.4em; /* Fixed size for currency symbols */
        }
        .price-currency {
            font-size: 0.4em; /* Redundant, but ensures consistency */
        }
`;
    document.head.appendChild(style);


// Create row elements and store them in an array
    const rowElements = priceData.map(item => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('price-row');

        const amountDiv = document.createElement('div');
        amountDiv.classList.add('price-amount');
        amountDiv.textContent = item.amount;

        const currencyDiv = document.createElement('div');
        currencyDiv.classList.add('price-currency');
        currencyDiv.textContent = item.currency;

        rowDiv.appendChild(amountDiv);
        rowDiv.appendChild(currencyDiv);
        return rowDiv;
    });

// Replace the children of the priceDiv with the row elements
    priceDiv.replaceChildren(...rowElements);
}

/**
 * Updates the price on the page by calculating the Holy Land Fee and converting the price.
 */
async function updatePrice() {
    console.log('Inside updatePrice function');

    const priceElement = document.querySelector('.price');
    if (!priceElement) {
        return console.error('Price element not found');
    }

    const priceNodeText = priceElement.childNodes[0].nodeValue.trim();
    const priceValue = parseFloat(priceNodeText.replace('.', '').replace(',', '.'));

    const euroPriceElement = document.querySelector('.price__secondary');
    if (!euroPriceElement) {
        return console.error('Euro price element not found');
    }

    const euroAmountText = euroPriceElement.textContent.trim().replace('.', '').replace(',', '.').match(/[\d.]+/);
    if (!euroAmountText) {
        return console.error('Euro amount not found in price element');
    }

    const euroAmount = parseFloat(euroAmountText[0]);
    const conversionRate = await getConversionRate();
    console.log(`EUR: ${conversionRate}`);
    const convertedPrice = calculateHolyLandFee(euroAmount) * conversionRate;
    const convertedPriceFormatted = convertedPrice.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    // Data for the rows
    const priceData = [
        {type: 'HLF-NIS', amount: convertedPriceFormatted, currency: '₪'},
        {type: 'src-EUR', amount: euroAmount, currency: '€'},
        {type: 'old-NIS', amount: priceNodeText, currency: '₪'},
    ];

    // Replace the price div with the new structure
    replaceDivs(priceData);
}

// Initial run for loaded content
console.log('updatePrice function called', updatePrice());


