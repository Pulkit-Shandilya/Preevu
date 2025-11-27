from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv
import re   
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for Chrome extension

client = OpenAI(api_key=os.getenv('API_KEY'))
# Mock mode for testing without API credits
MOCK_MODE = os.getenv('MOCK_MODE', 'false').lower() == 'true'

@app.route('/api/process', methods=['POST'])
def process_data():
    """
    Process data sent from the Chrome extension with product information
    """
    try:
        data = request.get_json()
        user_query = data.get('query', '')
        product_title = data.get('productTitle', '')
        product_info = data.get('productInfo', '')
        platform = data.get('platform', '')
        url = data.get('url', '')
        

        #  remove  whitespace  blank lines
        if product_info:
            product_info = re.sub(r' +', ' ', product_info) # Replace multiple spaces 
            product_info = re.sub(r'\n+', '\n', product_info)# Replace multiple newlines 
            product_info = '\n'.join(line.strip() for line in product_info.split('\n') if line.strip())# Remove whitespace
        
        # Clean  product title
        if product_title:
            product_title = ' '.join(product_title.split())

        # CHATGPT Prompt
        context = f"""
You are a helpful shopping assistant. A user is viewing a product and has a question about it.

Product Platform: {platform}
Product Title: {product_title}
Product Information: {product_info[:2000]}

User Question: {user_query}

Answer the questions based on the product information available, and give the answer in concise points. If the information is not available, respond with "Information not available in the product description." 
If there are better prices on some other reputable website, give that note at the end of the answer: "I did find better pricing on <url of the cheaper website>" if cheaper price is not found, omit this line.

Keep the answer length under 300 words.
"""

        # Mock mode for testing
        if MOCK_MODE:
            result = f"[MOCK MODE - No API call made]\n\nProduct: {product_title}\nPlatform: {platform}\n\nYour question: {user_query}\n\nThis is a mock response. Enable OpenAI API to get real answers."
        else:
            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": f"""You are a helpful shopping assistant that answers questions about products based on their descriptions and details.
                                        Give the outout as an HTML formatted response which can fit and render between <div> tags.
                        """
                    },
                    {
                        "role": "user",
                        "content": context
                    }
                ],
                max_tokens=500,
                temperature=0.5  # < higher is random- creativity level
            )

            result = response.choices[0].message.content

        return jsonify({
            'success': True,
            'result': result,
            'platform': platform
        })
    
    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Log the error
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'message': 'Backend is running'
    })

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)


    
#chat.extensionUnification.enabled
'''what is the product name?
what is the brand?
how many pages?
is this book for adults?
can my 12 year old child read it?

can i get it cheaper somewhere else?
'''