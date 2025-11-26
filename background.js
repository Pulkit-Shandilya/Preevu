// Background service worker
let ecom_title = '';
let ecom_info = '';
let ecom_platform = '';
let ecom_url = '';

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getData') {
        // Send stored product data
        sendResponse({ 
            title: ecom_title,
            info: ecom_info,
            platform: ecom_platform,
            url: ecom_url
        });
    }
    else if (request.action === 'productDataExtracted') {
        // Store product data from content script
        const data = request.data;
        ecom_title = data.title || '';
        ecom_info = data.info || '';
        ecom_platform = data.platform || '';
        ecom_url = data.url || '';
        
        console.log('=== Product Data Stored ===');
        console.log('Platform:', ecom_platform);
        console.log('URL:', ecom_url);
        console.log('Title:', ecom_title);
        console.log('Info Length:', ecom_info.length);
        console.log('Full Info:', ecom_info);
        console.log('===========================');
    }
    return true;
});

