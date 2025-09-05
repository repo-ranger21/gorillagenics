# GuerillaGenics - NFL Betting & Sports Analytics Platform

## Overview

GuerillaGenics is a full-stack DFS NFL betting and sports analytics platform that combines biometric health metrics with advanced simulation algorithms to provide data-driven betting recommendations. The platform features a satirical gorilla mascot-driven UI with jungle theming, BioBoost scoring for player performance prediction, and Monte Carlo simulations for Super Bowl probability calculations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**React SPA with Modern Stack**: The client is built as a single-page application using React 18 with TypeScript, providing a responsive and interactive user experience. The architecture follows a component-based approach with clear separation of concerns.

**Styling & Design System**: TailwindCSS is used for styling with a custom jungle-themed color palette (deep greens, banana yellows, primal reds) defined in CSS variables. The design system includes shadcn/ui components for consistent UI elements and Radix UI primitives for accessibility.

**State Management**: React Query (@tanstack/react-query) handles server state management, API caching, and data synchronization. Local component state is managed using React hooks.

**Routing**: wouter is used for client-side routing, providing a lightweight routing solution for navigating between landing page, dashboard, and other sections.

**Animation System**: Framer Motion provides smooth animations for section reveals (fade-in, slide-up), score changes (pulse/bounce), and alert notifications (gorilla shake/flash).

### Backend Architecture

**Express.js API Server**: The server uses Express.js with TypeScript, providing RESTful API endpoints for player data, biometric metrics, alerts, and Super Bowl simulation results.

**In-Memory Storage**: Currently implements a memory-based storage solution (MemStorage class) for rapid prototyping, with interfaces designed to easily switch to persistent database storage later.

**Vite Development Integration**: The server integrates with Vite for development mode, providing hot module replacement and optimized builds for production.

**Route Structure**: API routes are organized by feature:
- `/api/players` - Player data and BioBoost scores
- `/api/biometrics` - Biometric metric definitions
- `/api/alerts` - Juice Watch alert notifications
- `/api/superbowl` - Super Bowl simulation results

### Data Layer

**Database Schema Design**: Uses Drizzle ORM with PostgreSQL schema definitions for players, alerts, and bio metrics. The schema supports comprehensive player tracking with biometric data, betting lines, and performance metrics.

**Type Safety**: Shared TypeScript types between client and server ensure type safety across the full stack. Drizzle-Zod integration provides runtime validation and schema inference.

**Mock Data System**: Comprehensive mock data system provides realistic player data, biometric scores, and alerts for development and testing.

### Core Features

**BioBoost Scoring Engine**: Weighted algorithm combining multiple biometric factors:
- Sleep Score (30%)
- Testosterone Proxy (40%)
- Cortisol Proxy (15%)
- Hydration Level (10%)
- Injury Recovery (5%)

**Juice Watch Alert System**: Real-time notification system for significant metric changes with configurable alert levels (Zen Gorilla, Alpha Ape, Full Bananas) and animated mascot reactions.

**Player Performance Cards**: Interactive cards displaying comprehensive player metrics, betting recommendations, confidence levels, and satirical commentary.

## External Dependencies

**UI Component Library**: Radix UI provides accessible, unstyled components that are customized with TailwindCSS. shadcn/ui component collection offers pre-built components following design system patterns.

**Database Infrastructure**: Neon Database (@neondatabase/serverless) for PostgreSQL hosting with serverless architecture. Drizzle ORM for type-safe database operations and migrations.

**Development Tools**: 
- Vite for fast development server and optimized builds
- TypeScript for type safety across the stack
- ESBuild for server-side bundling in production

**Styling & Animation**:
- TailwindCSS for utility-first styling
- Framer Motion for complex animations and transitions
- Custom CSS variables for theme management

**Data Fetching**: React Query for server state management, caching, and synchronization with built-in error handling and loading states.

**Form Handling**: React Hook Form with Hookform Resolvers for form validation and management.

**Utility Libraries**:
- date-fns for date manipulation
- clsx and tailwind-merge for conditional CSS classes
- class-variance-authority for component variant management