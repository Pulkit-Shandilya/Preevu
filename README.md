# Chrome Extension with Python Backend

A boilerplate for a Chrome extension with a Python Flask backend.

## Project Structure

```
.
├── manifest.json          # Chrome extension manifest
├── popup.html            # Extension popup UI
├── popup.css             # Popup styles
├── popup.js              # Popup functionality
├── background.js         # Background service worker
├── icons/                # Extension icons (add your own)
└── backend/
    ├── app.py           # Flask backend
    └── requirements.txt  # Python dependencies
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend folder:
   ```powershell
   cd backend
   ```

2. Create a virtual environment:
   ```powershell
   python -m venv venv
   ```

3. Activate the virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

4. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

5. Run the Flask server:
   ```powershell
   python app.py
   ```

   The server will start at `http://localhost:5000`

### Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`

2. Enable "Developer mode" (toggle in the top right)

3. Click "Load unpacked"

4. Select the root folder of this project (containing `manifest.json`)

5. The extension should now appear in your extensions list

## Usage

1. Make sure the Python backend is running (`python app.py` in the backend folder)

2. Click the extension icon in Chrome toolbar

3. Enter some text in the input field

4. Click "Send to Backend"

5. The backend will process the text (converts to uppercase in this example) and return the result

## Customization

- **Backend (`backend/app.py`)**: Add your Python logic in the `/api/process` endpoint
- **Popup (`popup.js`)**: Modify the frontend logic and API calls
- **Styling (`popup.css`)**: Customize the extension's appearance
- **Icons**: Add your own icons in an `icons/` folder (16x16, 48x48, 128x128 PNG files)

## API Endpoints

- `POST /api/process` - Process data from the extension
- `GET /api/health` - Health check endpoint

## Notes

- The backend uses CORS to allow requests from the Chrome extension
- Make sure the backend is running before using the extension
- The extension has permission to access `http://localhost:5000/*`
