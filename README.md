# Wake-Up Light Web App

A modern web interface for controlling an ESP32-based wake-up light system. Control brightness, set alarms, and choose from preset lighting scenarios via an intuitive React application.

**Companion Project:** [ESP32 Backend](https://github.com/yourusername/wake-up-light) - Arduino-based controller for the LED lights

## Features

- 🌅 **Real-time Status Display** - Monitor current time, alarm status, and brightness levels
- ⏰ **Alarm Management** - Set alarm times with 24-hour format and toggle on/off via switch
- 💡 **Brightness Control** - 10-bit PWM resolution (0-1023) with dual warm/cool LED channels
- 🎨 **Preset Lighting** - Quick access presets: Warm, Neutral, Morning, Day, Evening, Night, Bedtime
- 📱 **Mobile Friendly** - Responsive design optimized for phones and tablets
- ⚡ **Real-time Sync** - Auto-polling status updates every second
- 🐳 **Docker Ready** - Pre-configured for containerized deployment

## Tech Stack

- **Frontend Framework:** React 19 with TypeScript
- **Routing:** TanStack Router with file-based routing and loaders
- **Data Fetching:** TanStack Query for caching and auto-refetching
- **Form Validation:** Zod for runtime schema validation
- **Styling:** Tailwind CSS v4 with custom components
- **UI Components:** shadcn/ui
- **Build Tool:** Vite
- **Server:** Nginx (containerized)

## Prerequisites

- Node.js 20+
- npm or yarn
- Docker (for containerized deployment)
- Access to ESP32 backend API

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Configuration

Before running the app, configure the ESP32 backend URL:

```bash
# Create .env file
cp .env.example .env  # if available

# Edit .env
VITE_ESP32_URL=http://192.168.1.100
```

Replace the IP address with your actual ESP32 address.

## Building for Production

```bash
# Build the optimized production bundle
npm run build

# Preview the production build locally
npm run preview
```

The built files are in the `dist/` directory.

## Docker Deployment

### Build and Run Locally

```bash
# Build Docker image
docker build -t wake-up-light-web:latest .

# Run container
docker run -p 80:3000 wake-up-light-web:latest
```

Access the app at `http://localhost:3000`

### Environment Variables

When running via Docker, pass environment variables via your runtime config or docker-compose:

```yaml
version: '3.8'
services:
  app:
    image: wake-up-light-web:latest
    ports:
      - "80:3000"
    environment:
      - VITE_ESP32_URL=http://esp32:80
    networks:
      - local
```

## CI/CD Pipeline

This project includes GitHub Actions for automated Docker image building and pushing to Docker Hub.

### Setup

1. Create Docker Hub account if you don't have one
2. Generate access token at https://hub.docker.com/settings/security
3. Add GitHub Secrets to your repository:
   - `DOCKERHUB_USERNAME` - Your Docker Hub username
   - `DOCKERHUB_TOKEN` - Your Docker Hub access token (NOT password)

### Auto-Deployment

On every push to `main`, the workflow will:
- Build the Docker image
- Push to Docker Hub as `username/wake-up-light-web`
- Tag with `latest`, branch name, and git SHA

Pull and run latest version:

```bash
docker pull your-username/wake-up-light-web:latest
docker run -p 80:3000 your-username/wake-up-light-web:latest
```

## Project Structure

```
src/
├── lib/
│   ├── api.ts           # ESP32 API client with Zod schemas
│   └── utils.ts         # Utility functions
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── Header.tsx       # App header
│   └── ...              # Feature components
├── routes/
│   ├── __root.tsx       # Root layout
│   └── index.tsx        # Home/controller page
├── main.tsx             # React entry point
└── styles.css           # Global styles
```

## API Integration

The app communicates with the ESP32 backend via REST API:

- `GET /status` - Current system status
- `POST /set-alarm` - Set alarm time
- `POST /toggle-alarm` - Enable/disable alarm
- `POST /set-brightness` - Set warm/cool brightness (0-1023)
- `POST /manual-on` - Fade lights to full brightness
- `POST /manual-off` - Fade lights to off

All requests and responses are validated with Zod schemas.

## Development

```bash
# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run tsc

# Format code
npm run format

# Lint code
npm run lint
```

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

**App won't connect to ESP32:**
- Verify ESP32 IP address in `.env`
- Check that ESP32 is on the same network
- Ensure ESP32 backend is running

**Sliders not updating:**
- Check browser console for errors
- Verify brightness values are 0-1023
- Try hard refresh (Ctrl+Shift+R)

**Preset buttons disabled:**
- Likely a network error
- Check ESP32 connectivity
- Review browser network tab for failed requests

## Contributing

This is a personal project, but feel free to fork and customize for your own setup!

## License

MIT

## Support

For issues with the web app, check the [GitHub Issues](https://github.com/yourusername/wake-up-light-web/issues).

For ESP32 backend issues, see the [companion repository](https://github.com/yourusername/wake-up-light).
