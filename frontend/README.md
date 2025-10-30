# React Frontend

Modern frontend application built with React, Vite, and TailwindCSS.

## Features

- **React 18**: Latest React features
- **Vite**: Lightning-fast build tool
- **TailwindCSS**: Utility-first CSS framework
- **TypeScript**: Type-safe development
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Lucide Icons**: Beautiful icon library

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3001
VITE_PYTHON_API_URL=http://localhost:8000
```

## Running the app

```bash
# development
npm run dev

# build
npm run build

# preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # UI components (Button, Card, Input)
│   │   └── Layout.tsx    # Main layout
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/              # Utilities
│   │   ├── api.ts        # Axios instance
│   │   └── utils.ts      # Helper functions
│   ├── pages/            # Page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── DashboardPage.tsx
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## Pages

### Home Page (`/`)
- Landing page with features overview
- Call-to-action buttons
- Tech stack showcase

### Login Page (`/login`)
- User authentication
- Form validation
- Error handling

### Register Page (`/register`)
- User registration
- Form validation
- Auto-login after registration

### Dashboard Page (`/dashboard`)
- Protected route (requires authentication)
- User information display
- System statistics
- Service health checks

## Components

### UI Components
- **Button**: Customizable button with variants
- **Input**: Styled input field
- **Card**: Container component with header/content/footer

### Layout
- Navigation bar with authentication state
- Responsive design
- Protected routes

## Styling

The app uses TailwindCSS with a custom design system:
- Color scheme with CSS variables
- Responsive breakpoints
- Dark mode support (configured)

## Authentication

Authentication is handled through the `AuthContext`:
- JWT token storage in localStorage
- Automatic token injection in API requests
- Protected routes redirect to login
- Auto-logout on 401 responses

## API Integration

All API calls go through the configured axios instance (`lib/api.ts`):
- Automatic token injection
- Error handling
- Base URL configuration
