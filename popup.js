document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('sendButton');
    const inputField = document.getElementById('inputField');
    const responseDiv = document.getElementById('response');

    sendButton.addEventListener('click', async function() {
        const inputText = inputField.value;
        
        if (!inputText) {
            responseDiv.textContent = 'No Input Provided,\nPlease enter some query about the product.';
            return;
        }

        try {
            responseDiv.textContent = 'Loading...';
            
            // Send request to Python backend
            const response = await fetch('http://localhost:5000/api/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: inputText })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            responseDiv.textContent = `Response: ${data.result}`;
            
        } catch (error) {
            responseDiv.textContent = `Error: ${error.message}`;
            console.error('Error:', error);
        }
    });
});
