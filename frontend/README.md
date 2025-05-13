# Smart Health Tracker - Frontend

## Project Overview
This is the frontend for the Smart Health Tracker application - a personalized diet and fitness planner that uses AI to generate customized health plans.

## Tech Stack
- **React.js** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Router** - Navigation
- **React Query** - Data fetching
- **Axios** - HTTP client

## Project Structure
The project follows a component-based architecture with the following structure:

```
src/
├── assets/         # Static assets like images, icons
├── components/     # Reusable UI components
│   ├── auth/       # Authentication related components
│   ├── dashboard/  # Dashboard components
│   ├── onboarding/ # Onboarding wizard components
│   ├── common/     # Common UI elements
│   └── store/      # Mini store components
├── context/        # React context for state management
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── App.tsx         # Main App component
└── main.tsx        # Entry point
```

## Features to Implement
1. Authentication & Account Handling
2. Onboarding System
3. Smart Planner with GPT-4 integration
4. Personalized Dashboard
5. Goal Management System
6. Mini Store (Frontend-Only)
7. AI Progress Tracker

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Development Guidelines
- Follow mobile-first responsive design
- Implement accessible UI components
- Use TypeScript for all components
- Follow component-based architecture
- Implement proper error handling
- Use React Query for data fetching and caching