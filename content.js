// Content script that runs on e-commerce product pages

// Scraping configuration for different e-commerce platforms
const PLATFORM_SELECTORS = {
    amazon: {
        name: 'amazon',
        titleSelectors: ['#productTitle', '.product-title-word-break'],
        infoSelectors: [
            { selector: '#feature-bullets ul li span.a-list-item', label: 'Features' },
            { selector: '.a-expander-content.a-expander-partial-collapse-content', label: 'Description' },
            { selector: '#productDetails_detailBullets_sections1', label: 'Details' },
            { selector: '#bookDescription_feature_div', label: 'Book Description' },
            { selector: '#productDescription', label: 'Product Description' }
        ]
    },
    flipkart: {
        name: 'flipkart',
        titleSelectors: ['.VU-ZEz', '.B_NuCI', '._35KyD6'],
        infoSelectors: [
            { selector: '.cPHDOP.col-12-12', label: 'Description' },
            { selector: '.DOjaWF.YJG4Cf', label: 'Details' },
            { selector: '._1mXcCf', label: 'Specifications' }
        ]
    },
    ebay: {
        name: 'ebay',
        titleSelectors: ['#itemTitle', '.it-ttl'],
        infoSelectors: [
            { selector: '#desc_ifr', label: 'Description' },
            { selector: '.ux-layout-section-evo__item', label: 'Details' }
        ]
    },
    walmart: {
        name: 'walmart',
        titleSelectors: ['h1[itemprop="name"]', '.prod-ProductTitle'],
        infoSelectors: [
            { selector: '.about-desc', label: 'About' },
            { selector: '[data-testid="product-highlights"]', label: 'Highlights' },
            { selector: '.dangerous-html', label: 'Description' }
        ]
    },
    myntra: {
        name: 'myntra',
        titleSelectors: ['.pdp-title', '.pdp-name'],
        infoSelectors: [
            { selector: '.pdp-product-description-content', label: 'Description' },
            { selector: '.index-tableContainer', label: 'Specifications' }
        ]
    },
    ajio: {
        name: 'ajio',
        titleSelectors: ['.prod-name', '.title'],
        infoSelectors: [
            { selector: '.prod-details', label: 'Details' },
            { selector: '.prod-description', label: 'Description' }
        ]
    },
    snapdeal: {
        name: 'snapdeal',
        titleSelectors: ['.pdp-e-i-head', 'h1[itemprop="name"]'],
        infoSelectors: [
            { selector: '.detailssubbox', label: 'Details' },
            { selector: '.productSpecs', label: 'Specifications' }
        ]
    },
    meesho: {
        name: 'meesho',
        titleSelectors: ['h1', '.sc-dkrFOg'],
        infoSelectors: [
            { selector: '.ProductDescription__StyledParagraph', label: 'Description' },
            { selector: '.ProductDetailsCard__StyledUl', label: 'Details' }
        ]
    }
};

function extractProductInfo() {
    const currentUrl = window.location.hostname;
    let productTitle = '';
    let productInfo = '';
    let platform = '';
    
    // Detect platform from URL
    for (const [key, config] of Object.entries(PLATFORM_SELECTORS)) {
        if (currentUrl.includes(key)) {
            platform = config.name;
            
            // Extract title using multiple selectors
            for (const selector of config.titleSelectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim()) {
                    productTitle = element.textContent.trim();
                    break;
                }
            }
            
            // Extract product information using multiple selectors
            let allInfo = [];
            for (const { selector, label } of config.infoSelectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    const text = Array.from(elements)
                        .map(el => el.textContent.trim())
                        .filter(text => text.length > 0)
                        .join('\n');
                    
                    if (text) {
                        allInfo.push(`${label}:\n${text}`);
                    }
                }
            }
            
            productInfo = allInfo.join('\n\n');
            break;
        }
    }
    
    // Fallback if platform not recognized
    if (!platform) {
        platform = 'unknown';
        productTitle = '';
        productInfo = '';
    }

    const result = {
        platform: platform,
        title: productTitle,
        info: productInfo,
        url: window.location.href
    };
    
    console.log('Extracted product data:', {
        platform: result.platform,
        titleLength: result.title.length,
        infoLength: result.info.length
    });
    
    return result;
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractProductData') {
        const productData = extractProductInfo();
        console.log('Manual extraction requested, sending product data:');
        sendResponse(productData);
    }
    return true;
});

// Auto-extract on page load and send to background
window.addEventListener('load', () => {
    setTimeout(() => {
        const productData = extractProductInfo();
        if (productData.platform && productData.title) {
            chrome.runtime.sendMessage({
                action: 'productDataExtracted',
                data: productData
            });
        }
    }, 2000); // Wait 2 seconds for page to fully load
});
