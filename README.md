# OPDEMRSYS - OPD EMR System

A web-based **Outpatient Department (OPD) Electronic Medical Record
(EMR)** system designed to improve healthcare workflow, documentation
efficiency, and patient record management.

This system focuses on **structured clinical documentation**, **fast
patient record access**, and **workflow efficiency** for outpatient
healthcare environments.

------------------------------------------------------------------------

# Tech Stack

Frontend - React - Tailwind CSS - JavaScript

Backend - Node.js - Express.js - JavaScript

Database - PostgreSQL (Supabase)

ORM - Prisma ORM

Deployment - Vercel

------------------------------------------------------------------------

# Project Structure

    opdemrsys/

    client/        # React frontend
    server/        # Express backend

    project-spec.md
    prompts.txt
    README.md
    RBDC_DOCUMENTATION.md

### Frontend

    client/

    public/
    src/

    components/
    pages/
    layouts/
    services/
    hooks/
    utils/
    context/
    routes/

    App.jsx
    main.jsx

### Backend

    server/

    prisma/
    schema.prisma
    seed.js

    src/
    controllers/
    routes/
    middleware/
    services/
    config/
    utils/

    app.js
    server.js

    .env
    .env.example

------------------------------------------------------------------------

# Environment Variables

Sensitive values are stored in **environment variables** and must not be
hardcoded.

Example:

server/.env.example

    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

    SUPABASE_URL="https://your-project.supabase.co"
    SUPABASE_ANON_KEY="your-anon-key"

    JWT_SECRET="your-super-secret-key"

    SYSTEM_NAME="OPDEMRSYS"
    SYSTEM_FULL_NAME="OPD EMR System"

    PORT=5000

Frontend example:

    VITE_SYSTEM_NAME="OPDEMRSYS"
    VITE_SYSTEM_FULL_NAME="OPD EMR System"
    VITE_API_URL="http://localhost:5000/api"

Developers should copy `.env.example` into `.env` and update values.

------------------------------------------------------------------------

# Core Features

Authentication and Role-Based Access - Login - Secure authentication -
Role permissions

Admin User Management - Create users - Update users - Manage roles

Patient Management - Patient registration - Patient search - Patient
profile

Nurse Documentation - Vital signs - Chief complaint - Nursing notes

Doctor Consultation - Diagnosis - Treatment plan - Consultation notes

Prescription Module - Medication entry - Dosage and duration

Visit Management - Register visits - Track consultation status

Smart OPD Queue - Patient queue - Triage priority

Reports - Daily visits - Patient statistics

------------------------------------------------------------------------

# Development Workflow (AI Assisted)

The project uses **AI-assisted development** with phased prompts.

Files used:

-   `project-spec.md` → full system specification
-   `prompts.txt` → AI prompts for development phases

Development phases:

1.  Architecture
2.  Prisma schema
3.  Backend scaffold
4.  Authentication module
5.  Frontend scaffold
6.  Feature modules

------------------------------------------------------------------------

# Deployment

Frontend deployed from:

    client/

Backend deployed from:

    server/

Deployment platform:

Vercel

Ensure environment variables are configured in the Vercel project
settings.

------------------------------------------------------------------------

# Security

The system includes:

-   role-based access control
-   password hashing
-   protected API routes
-   environment variable management
-   secure patient data handling

------------------------------------------------------------------------

# Future Enhancements

Possible future improvements:

-   laboratory integration
-   pharmacy system
-   billing module
-   advanced analytics
-   notifications

------------------------------------------------------------------------

# License

This project is intended for **educational and research purposes**.
