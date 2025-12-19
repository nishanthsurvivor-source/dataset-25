# Smart Office Automation Agent - Frontend

Modern React frontend built with Vite and Tailwind CSS for the Smart Office Automation Agent.

## Features

- 🚀 **Fast Development**: Built with Vite for instant HMR
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 📝 **Transcript Input**: Easy-to-use form for entering meeting transcripts
- 📊 **Results Display**: Comprehensive display of Minutes of Meeting in multiple formats
- 💾 **Download Support**: Download results as text or JSON
- 🔄 **Real-time Processing**: Connect to FastAPI backend for live processing

## Prerequisites

- Node.js 18+ and npm
- FastAPI backend running on `http://localhost:8000`

## Installation

```bash
# Install dependencies
npm install

# Install Tailwind CSS (if not already installed)
npm install -D tailwindcss postcss autoprefixer
```

## Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:3000
```

## Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── TranscriptForm.jsx    # Form for entering transcript
│   │   └── MoMDisplay.jsx        # Display component for results
│   ├── services/
│   │   └── api.js                # API service for backend communication
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Tailwind CSS imports
├── public/                        # Static assets
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
└── vite.config.js                # Vite configuration
```

## API Integration

The frontend connects to the FastAPI backend at `http://localhost:8000`.

### Endpoints Used

- `POST /process` - Process meeting transcript
  - Request: `{ transcript: string, meeting_title?: string }`
  - Response: `{ mom_text: string, mom_json: object }`

- `GET /health` - Health check (optional)

## Usage

1. **Start the Backend**:
   ```bash
   cd ../backend
   uvicorn backend.app:app --reload
   ```

2. **Start the Frontend**:
   ```bash
   npm run dev
   ```

3. **Use the Application**:
   - Enter meeting title (optional)
   - Paste meeting transcript
   - Click "Generate Minutes of Meeting"
   - View results in multiple formats
   - Download as text or JSON

## Features

### Transcript Form
- Optional meeting title input
- Large textarea for transcript input
- Character count display
- Loading state during processing
- Error handling and display

### Results Display
- **Text Format**: Formatted plain text display
- **Structured View**: Organized sections for:
  - Meeting information
  - Summary (bullet points)
  - Decisions made
  - Action items (table format)
  - Next steps / Follow-ups
- **Download Options**: Download as text or JSON
- **Responsive Design**: Works on all screen sizes

## Customization

### Tailwind Configuration

Edit `tailwind.config.js` to customize:
- Colors (primary color scheme)
- Typography
- Spacing
- Breakpoints

### API Base URL

To change the backend URL, edit `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://your-backend-url:port';
```

## Troubleshooting

### CORS Errors

If you see CORS errors, ensure:
1. Backend CORS is configured for `http://localhost:5173` (or your frontend URL)
2. Backend is running and accessible

### Connection Errors

If the frontend can't connect to the backend:
1. Verify backend is running on `http://localhost:8000`
2. Check backend health: `curl http://localhost:8000/health`
3. Verify API endpoint: `curl http://localhost:8000/`

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Fetch API** - HTTP requests

## License

Hackathon Project
