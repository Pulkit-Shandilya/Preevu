from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for Chrome extension

# Load API key from environment variable
chatgpt = openai.ChatCompletion.create(
    model="gpt-4",
    api_key=os.getenv('API_KEY')
)

@app.route('/api/process', methods=['POST'])
def process_data():
    """
    Process data sent from the Chrome extension
    """
    try:
        data = request.get_json()
        text = data.get('text', '')

        message =  chatgpt.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "user",
                    "content": text
                }
            ]
        )

        # Process the text (example: convert to uppercase)
        result = message.choices[0].message.content

        return jsonify({
            'success': True,
            'result': result,
            'original': text
        })
    
    except Exception as e:
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
