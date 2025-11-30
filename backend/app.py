from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv
import re   
load_dotenv()

app = Flask(__name__)
CORS(app)  

client = OpenAI(api_key=os.getenv('API_KEY'))

@app.route('/api/process', methods=['POST'])
def process_data():
    """
    Process data sent from the Chrome extension with product information
    """
    try:
        data = request.get_json()
        
        # Input validation
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        e_user_query = data.get('query', '')
        e_product_title = data.get('productTitle', '')
        e_product_info = data.get('productInfo', '')
        e_platform = data.get('platform', '')
        
        # Validate required fields
        if not e_user_query:
            return jsonify({
                'success': False,
                'error': 'Query is required'
            }), 400
        

        # Clean and normalize text data
        if e_product_info:
            # Strip lines and remove blanks in single pass, then normalize whitespace
            e_product_info = '\n'.join(line.strip() for line in e_product_info.split('\n') if line.strip())
        
        if e_product_title:
            e_product_title = ' '.join(e_product_title.split())

        # Build AI prompt
        context = f"""
You are a helpful shopping assistant. A user is viewing a product and has a question about it.

Product Platform: {e_platform}
Product Title: {e_product_title}
Product Information: {e_product_info[:2000]}

User Question: {e_user_query}

Answer the questions based on the product information available, and give the answer in concise points. 
If the information is not available, respond with "Information not available in the product description." 

Keep the answer length under 300 words.
"""

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
            temperature=0.6  # < higher is random- creativity level
        )

        result = response.choices[0].message.content
        
        return jsonify({
            'success': True,
            'result': result,
            'platform': e_platform
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