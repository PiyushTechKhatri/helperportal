# JaipurHelp - Marketplace Platform

## Overview

JaipurHelp is a hyperlocal marketplace platform connecting verified helpers and workers (maids, drivers, cooks, security guards, construction workers, factory workers) with clients and businesses in Jaipur, India. The platform features area-wise search, KYC verification, subscription-based contact access, and bilingual support (English/Hindi) optimized for mobile-first usage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management, caching, and data synchronization

**UI Component System**
- Shadcn/ui component library based on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Custom theming system supporting light/dark modes via CSS variables
- Responsive design system using Tailwind breakpoints (mobile-first approach)

**State Management Pattern**
- React Context API for global app state (Theme, Language, Authentication)
- React Query for all server-state (workers, jobs, subscriptions)
- React Hook Form for complex form state management with Zod validation
- Local component state via useState/useReducer for UI-only concerns

**Key Design Decisions**
- Bilingual support (English/Hindi) using custom translation context
- Google Fonts integration (Inter for English, Noto Sans Devanagari for Hindi text)
- Mobile-first responsive design targeting Jaipur's mobile-heavy user base
- Progressive enhancement with server-side rendering fallbacks

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server framework
- TypeScript for type safety across the entire stack
- RESTful API design pattern with conventional HTTP methods
- Session-based authentication with PostgreSQL session store

**Database Layer**
- Drizzle ORM for type-safe database operations and schema management
- PostgreSQL as the primary database via Neon serverless
- Schema-first design with extensive use of enums for type safety
- Separate tables for users, workers, jobs, subscriptions, payments, KYC documents

**Authentication & Authorization**
- Replit Auth (OpenID Connect) for user authentication
- Passport.js strategy for OIDC integration
- Session management with express-session and connect-pg-simple
- Role-based access control (client, worker, agent, admin roles)

**Key API Patterns**
- RESTful endpoints organized by resource type (`/api/workers`, `/api/jobs`, `/api/subscription`)
- Role-based route protection using middleware
- Consistent error handling and response formats
- Request validation using Zod schemas derived from Drizzle tables

### Data Storage

**Database Schema Design**
- Users table supporting multiple roles (client, worker, agent, admin)
- Workers table with detailed profile information and verification status
- Categories and Areas for hierarchical organization
- Jobs table for employer job postings
- Subscriptions and SubscriptionPlans for monetization
- KYC Documents for worker verification
- Contact tracking (ContactViews, SavedWorkers) for subscription enforcement

**Key Schema Decisions**
- PostgreSQL enums for controlled vocabularies (roles, statuses, tiers)
- Separate verification levels (none, basic, police, premium)
- JSONB fields for flexible feature lists in subscription plans
- Timestamp fields for created/updated tracking across all entities
- Foreign key relationships enforced at database level

**Data Access Patterns**
- Storage abstraction layer (`server/storage.ts`) encapsulating all database operations
- Type-safe query builders using Drizzle ORM
- JOIN operations for fetching related data (WorkerWithDetails, JobWithDetails types)
- Filtering and search via Drizzle's query API (ilike, gte, lte, inArray)

### External Dependencies

**Database & Infrastructure**
- Neon Serverless PostgreSQL - Primary database with WebSocket support
- Replit Auth (OpenID Connect) - User authentication and identity management
- Replit deployment platform - Hosting and environment management

**Frontend Libraries**
- Radix UI - Accessible, unstyled component primitives for 20+ UI components
- TanStack Query v5 - Server state management and caching
- React Hook Form - Form state management with performance optimization
- Zod - Runtime type validation and schema definition
- date-fns - Date formatting and manipulation
- Tailwind CSS - Utility-first CSS framework

**Backend Libraries**
- Drizzle ORM - Type-safe SQL query builder and schema manager
- Drizzle-Zod - Automatic Zod schema generation from Drizzle tables
- Express Session - Session middleware for Express
- Connect-PG-Simple - PostgreSQL session store adapter
- Passport - Authentication middleware framework
- OpenID Client - OIDC protocol implementation

**Build & Development Tools**
- esbuild - Fast JavaScript bundler for server code
- TypeScript - Static type checking across frontend and backend
- Vite plugins (@replit/vite-plugin-runtime-error-modal, cartographer, dev-banner)
- PostCSS with Autoprefixer - CSS processing pipeline

**Design System Dependencies**
- Google Fonts API - Inter and Noto Sans Devanagari font families
- Lucide React - Icon library for consistent UI iconography
- class-variance-authority - Utility for creating variant-based component APIs
- tailwind-merge & clsx - Conditional className utilities