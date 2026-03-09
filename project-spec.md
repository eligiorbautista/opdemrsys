# OPD EMR Web Application Specification

## Overview

Web-based Outpatient Department (OPD) Electronic Medical Record (EMR)
system to improve healthcare workflow efficiency and documentation.

Primary Users - Doctors - Nurses

Secondary Users - Clinics - Students

## Tech Stack

Frontend - React - Tailwind CSS - JavaScript only

Backend - Node.js - Express.js - JavaScript only

Database - PostgreSQL (Supabase)

ORM - Prisma ORM

Deployment - Vercel

## Project Structure

opd-emr-system/

client/ -\> React frontend\
server/ -\> Express backend

project-spec.md\
README.md

### Frontend Structure

client/ public/ src/ components/ pages/ layouts/ services/ hooks/ utils/
context/ routes/ App.jsx main.jsx

### Backend Structure

server/ prisma/ schema.prisma seed.js

src/ controllers/ routes/ middleware/ services/ config/ utils/ app.js
server.js

.env .env.example

## Environment Variables

Sensitive data must never be hardcoded.

All secrets must use environment variables.

Example server/.env.example

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key" JWT_SECRET="your-super-secret-key"
SYSTEM_NAME="OPD EMR System" PORT=5000

Example client env variables

VITE_SYSTEM_NAME="OPD EMR System"
VITE_API_URL="http://localhost:5000/api"

## Core Modules

Authentication Admin User Management Patient Management Nurse
Documentation Doctor Consultation Prescription Module Visit Management
Smart Queue Search & Retrieval Basic Reports

## Security Requirements

-   Role-based access control
-   Password hashing
-   Protected API routes
-   Input validation
-   Environment variables
-   Secure patient data handling

## UI/UX Goals

-   Minimal navigation
-   Clean clinical layout
-   Single-view patient information
-   Fast documentation workflow
