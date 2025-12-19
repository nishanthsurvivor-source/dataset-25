# Quick Start Guide

## Prerequisites

1. **Backend Running**: Make sure the FastAPI backend is running on `http://localhost:8000`
   ```bash
   cd backend
   uvicorn backend.app:app --reload
   ```

2. **Node.js**: Ensure Node.js 18+ is installed

## Setup

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**: Navigate to `http://localhost:3000`

## Usage

1. Enter meeting title (optional)
2. Paste meeting transcript in the textarea
3. Click "Generate Minutes of Meeting"
4. View results in multiple formats
5. Download as text or JSON

## Troubleshooting

### Backend Connection Issues

If you see connection errors:
- Verify backend is running: `curl http://localhost:8000/health`
- Check CORS settings in backend (should allow `http://localhost:3000`)
- Frontend runs on port 3000 to match backend CORS configuration

### Tailwind Not Working

If styles aren't applying:
- Ensure `tailwind.config.js` and `postcss.config.js` exist
- Check `src/index.css` has Tailwind directives
- Restart dev server

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── services/        # API service
│   ├── App.jsx          # Main app
│   └── index.css        # Tailwind imports
├── tailwind.config.js   # Tailwind config
└── vite.config.js       # Vite config
```

