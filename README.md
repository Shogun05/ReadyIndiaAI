# ReadyIndia AI - Multilingual Disaster Alert System

A production-ready full-stack AI-powered disaster alert assistant that provides real-time disaster alerts in 8 Indian languages with AI simplification and safety instructions.

## 🚀 Features

### Core Features
- **Real-time Disaster Alerts**: Fetches live data from USGS (Earthquakes), GDACS (Global Disasters), and INCOIS (Tsunami warnings)
- **AI-Powered Simplification**: Uses Google Gemini AI to convert complex technical alerts into simple, actionable language
- **Multilingual Support**: Available in 8 languages - English, Hindi, Marathi, Tamil, Telugu, Kannada, Bengali, Gujarati
- **Geolocation-Based Alerts**: Shows disasters near user's location
- **Safety Instructions**: AI-generated step-by-step safety guidance for each disaster type
- **PWA Support**: Works offline with service worker caching
- **Interactive Map**: Visual representation of disaster locations using Leaflet

### Technical Features
- **Scheduled Data Fetching**: Automatic alert fetching every 30 minutes using APScheduler
- **MongoDB Storage**: Persistent storage of alerts with full translations
- **Responsive Design**: Mobile-first design with Tailwind CSS + ShadCN UI
- **Type Safety**: Pydantic models for backend validation
- **i18n Integration**: react-i18next for seamless language switching

## 📁 Project Structure

```
ReadyIndia AI/
├── backend/                    # Node.js/Express Backend
│   ├── models/                # Data models
│   │   ├── alert.js          # Alert model with disaster types
│   │   ├── index.js          # Model exports
│   │   └── safety_step.js    # Safety steps model
│   ├── routers/              # API route handlers
│   │   ├── alerts.js         # Alert CRUD operations
│   │   ├── ai.js             # AI simplification endpoints
│   │   ├── languages.js      # Language support
│   │   └── index.js          # Router exports
│   ├── services/             # Business logic
│   │   ├── alert_fetcher.js  # External API fetching
│   │   ├── gemini_client.js  # Gemini AI integration
│   │   ├── index.js          # Service exports
│   │   ├── logger.js         # Logging utility
│   │   └── translation_service.js # Translation handling
│   ├── logs/                 # Application logs
│   ├── package.json          # Node dependencies
│   ├── server.js             # Express/Node application
│   └── requirements.txt      # (Legacy) Python dependencies reference
│
├── frontend/                  # React Frontend
│   ├── public/
│   │   ├── index.html        # HTML entry point
│   │   ├── manifest.json     # PWA manifest
│   │   └── service-worker.js # Offline caching
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── AlertCard.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LanguageSwitcher.jsx
│   │   │   ├── MapComponent.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ui/           # ShadCN UI components
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── use-toast.js
│   │   ├── lib/              # Utility functions
│   │   │   └── utils.js
│   │   ├── pages/            # Route pages
│   │   │   ├── AlertDetail.jsx
│   │   │   ├── Alerts.jsx
│   │   │   ├── Explain.jsx
│   │   │   ├── Home.jsx
│   │   │   └── Settings.jsx
│   │   ├── i18n/             # i18n translation files
│   │   │   ├── en.json
│   │   │   └── hi.json
│   │   ├── i18n.js           # i18next configuration
│   │   ├── App.css           # Global styles
│   │   ├── App.js            # Main application
│   │   ├── index.css         # Root styles
│   │   └── index.js          # React entry point
│   ├── lingo/                # Lingo.dev translations (auto-generated)
│   │   ├── en.json
│   │   ├── hi.json
│   │   └── .versions
│   ├── plugins/              # Custom webpack plugins
│   │   ├── health-check/     # Health check plugin
│   │   └── visual-edits/     # Visual edits plugin
│   ├── craco.config.js       # Create React App config
│   ├── lingo.config.js       # Lingo.dev configuration
│   ├── tailwind.config.js    # TailwindCSS config
│   ├── postcss.config.js     # PostCSS config
│   ├── jsconfig.json         # JavaScript config
│   ├── components.json       # Component registry
│   ├── package.json          # Node dependencies
│   ├── .env                  # Environment variables
│   ├── .env.local            # Local overrides (git ignored)
│   └── README.md             # Frontend documentation
│
├── tests/                    # Testing directory
│   └── __init__.py          # Test initialization
│
├── lingo.config.js          # Root Lingo.dev configuration
├── README.md                 # Project documentation
├── package.json              # Root package (if monorepo)
└── .gitignore                # Git ignore rules
```

## 🛠️ Tech Stack

### Backend
- **Node.js 22**: JavaScript runtime
- **Express.js**: Fast, minimal web framework
- **MongoDB**: NoSQL database
- **Google Gemini AI**: Text simplification and translation
- **APScheduler**: Scheduled task execution (Node version)
- **Axios**: HTTP client for API calls
- **Dotenv**: Environment variable management

### Frontend
- **React 19**: UI library with hooks
- **React Router**: Client-side routing
- **TailwindCSS**: Utility-first CSS framework
- **ShadCN UI**: Beautiful component library
- **Lingo.dev**: AI-powered automatic multilingual translation
- **Leaflet**: Interactive maps
- **Axios**: HTTP client
- **Sonner**: Toast notifications

## 📡 API Endpoints

### Alerts
- `GET /api/alerts` - Get all alerts (with filters)
- `GET /api/alerts/{id}` - Get specific alert
- `GET /api/alerts/nearby` - Get alerts near location
- `POST /api/alerts` - Create new alert

### AI
- `POST /api/ai/simplify` - Simplify disaster alert text

### Languages
- `GET /api/languages/{lang}` - Get translations for language
- `GET /api/languages` - Get all supported languages

## 🌐 Data Sources

1. **USGS Earthquake Feed**
   - Real-time earthquake data
   - Global coverage
   - Magnitude, location, time information

2. **GDACS (Global Disaster Alert and Coordination System)**
   - Multiple disaster types (floods, cyclones, earthquakes)
   - RSS feed format
   - Global disaster monitoring

3. **INCOIS (Indian National Centre for Ocean Information Services)**
   - Tsunami warnings
   - Seismic activity data
   - Indian Ocean region focus

## 🚀 Deployment

The application is designed for deployment on your preferred platform.

### Services
Both frontend and backend can be deployed as services:
- Backend: FastAPI on port 5000 (or configurable)
- Frontend: React on port 3000 (or configurable)

### Environment Variables

**Backend (.env)**:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=readyindia_db
CORS_ORIGINS=*
GEMINI_API_KEY=<your-gemini-api-key>
USGS_API_URL=https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson
INCOIS_API_URL=https://www.incois.gov.in/geoportal/webservices/seismology/seismology.json
GDACS_API_URL=https://www.gdacs.org/xml/rss.xml
```

**Frontend (.env)**:
```env
REACT_APP_BACKEND_URL=http://localhost:5000
GOOGLE_API_KEY=<your-google-api-key>
```

## 💡 Key Features Implementation

### 1. AI Simplification
```python
# Gemini AI converts complex alerts to simple language
result = await gemini_client.simplify_alert(alert_text)
# Returns: { "simple": "...", "steps": [...] }
```

### 2. Multilingual Translation
```python
# Automatic translation to 7 Indian languages
translations = await translation_service.translate_to_all_languages(text)
# Returns: { "hi": "...", "mr": "...", "ta": "...", ... }
```

### 3. Scheduled Data Fetching
```python
# Runs every 30 minutes
scheduler.add_job(fetch_and_process_alerts, 'interval', minutes=30)
```

### 4. PWA Support
- Service worker caches static assets
- Offline fallback page
- Installable on mobile devices
- Manifest.json for app metadata

### 5. Geolocation Alerts
```javascript
// Get alerts within radius
GET /api/alerts/nearby?lat=20.5937&lon=78.9629&radius_km=500
```

## 🎨 Design System

### Color Palette
- **Primary**: Orange (#ea580c) - Urgency and safety
- **Secondary**: Red (#dc2626) - Critical alerts
- **Success**: Green (#16a34a) - Safety instructions
- **Neutral**: Gray shades for text and backgrounds

### Typography
- **Headings**: Playfair Display (serif) - Elegance and authority
- **Body**: Inter (sans-serif) - Readability and modernity

### Components
- Built with ShadCN UI for consistency
- Fully accessible with ARIA labels
- Responsive breakpoints (mobile, tablet, desktop)

## 📱 Pages Overview

### 1. Home (`/`)
- Hero section with tagline
- Feature cards
- Call-to-action buttons

### 2. Alerts (`/alerts`)
- Interactive map with markers
- Filter by disaster type and severity
- Nearby alerts based on geolocation
- Grid of alert cards

### 3. Alert Detail (`/alerts/:id`)
- Full alert information
- AI-simplified summary
- Step-by-step safety instructions
- Location map

### 4. Explain Alert (`/explain`)
- Text input for custom alerts
- AI simplification
- Multi-language tabs
- Safety steps generation

### 5. Settings (`/settings`)
- Language selection
- Location preferences
- Notification settings (planned)
- About information

## 🔒 Security & Performance

### Security
- Environment variables for sensitive data
- CORS configuration
- Input validation with Pydantic
- No hardcoded credentials

### Performance
- Async/await throughout backend
- MongoDB indexing on query fields
- Caching of translations
- Lazy loading of map components
- Optimized images and assets

## 🧪 Testing Strategy

### Backend Testing
- Unit tests for models and services
- Integration tests for API endpoints
- Mock external API calls
- Test data validation

### Frontend Testing
- Component testing with data-testid attributes
- E2E testing with Playwright
- Responsive design testing
- Accessibility testing

## 📊 Database Schema

### Alerts Collection
```javascript
{
  id: string,
  type: "earthquake" | "flood" | "cyclone" | ...,
  severity: "low" | "medium" | "high" | "critical",
  raw_text: string,
  ai_summary: string,
  ai_steps: string[],
  languages: {
    hi: { simple: string, steps: string[] },
    mr: { ... },
    // ... other languages
  },
  location: string,
  latitude: float,
  longitude: float,
  magnitude: float (optional),
  source: "USGS" | "GDACS" | "INCOIS",
  created_at: datetime
}
```

## 🌟 Future Enhancements

1. **Push Notifications**: Real-time browser notifications for critical alerts
2. **User Accounts**: Personalized alert preferences
3. **Alert History**: Track past disasters and responses
4. **Community Reports**: User-submitted disaster reports
5. **SMS Integration**: Send alerts via SMS for offline users
6. **Voice Alerts**: Audio announcements in regional languages
7. **Evacuation Routes**: AI-suggested safe routes
8. **Emergency Contacts**: Quick access to helpline numbers

## 📝 License

This project is built as a demonstration of full-stack development capabilities and disaster management solutions.

## 🙏 Acknowledgments

- **USGS** for earthquake data
- **GDACS** for global disaster alerts
- **INCOIS** for tsunami warnings
- **Google Gemini** for AI capabilities
- **Lingo.dev** for automatic multilingual translation

---

**Built with ❤️ for India's safety and preparedness**
