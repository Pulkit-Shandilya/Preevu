// Preevu Configuration
const PREEVU_CONFIG = {
    API_ENDPOINT: 'http://localhost:5000/api/process',
    HEALTH_ENDPOINT: 'http://localhost:5000/api/health',
    REQUEST_TIMEOUT: 30000,
    MAX_RETRIES: 3,
    MESSAGES: {
        NO_INPUT: 'No Input Provided,\nPlease enter some query about the product.',
        EXTRACTING: 'Extracting product data...',
        LOADING: 'Loading...',
        ERROR_PREFIX: 'Error: '
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('sendButton');
    const inputField = document.getElementById('inputField');
    const responseDiv = document.getElementById('response');

    chrome.runtime.sendMessage({ action: 'getData' }, (response) => {
        if (response && response.title) {
            console.log('Product data loaded:', response.platform);
        }
    });

    sendButton.addEventListener('click', async function() {
        const inputText = inputField.value;
        
        if (!inputText) {
            responseDiv.textContent = PREEVU_CONFIG.MESSAGES.NO_INPUT;
            return;
        }

        try {
            responseDiv.textContent = PREEVU_CONFIG.MESSAGES.EXTRACTING;
            
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Request fresh product data from content script
            chrome.tabs.sendMessage(tab.id, { action: 'extractProductData' }, async (productData) => {
                if (chrome.runtime.lastError) {
                    // Fallback to background script data if content script not available
                    console.log('Content script not available, using background data');
                    chrome.runtime.sendMessage({ action: 'getData' }, async (bgData) => {
                        await sendToBackend(inputText, bgData);
                    });
                } else {
                    console.log('Fresh product data:', productData);
                    // Also update background storage
                    chrome.runtime.sendMessage({ 
                        action: 'productDataExtracted', 
                        data: productData 
                    });
                    await sendToBackend(inputText, productData);
                }
            });
            
        } catch (error) {
            responseDiv.textContent = `Error: ${error.message}`;
            console.error('Error:', error);
        }
    });
    
    async function sendToBackend(query, productData) {
        try {
            responseDiv.textContent = PREEVU_CONFIG.MESSAGES.LOADING;
            
            console.log('Sending to backend:', {
                query,
                platform: productData.platform,
                titleLength: productData.title?.length || 0,
                infoLength: productData.info?.length || 0
            });
            
            // Send request to Python backend with both user query and product data
            const response = await fetch(PREEVU_CONFIG.API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    query: query,
                    productTitle: productData.title || '',
                    productInfo: productData.info || '',
                    platform: productData.platform || '',
                    url: productData.url || ''
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Network response was not ok');
            }

            const data = await response.json();
            
            // Render HTML content instead of plain text
            responseDiv.innerHTML = data.result;
            
        } catch (error) {
            responseDiv.textContent = `${PREEVU_CONFIG.MESSAGES.ERROR_PREFIX}${error.message}`;
            console.error('Error:', error);
        }
    }
});
