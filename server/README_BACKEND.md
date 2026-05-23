# Lead Management Backend (Pure pg, no ORM)

A NestJS (JavaScript) REST API for lead capture, admin management, notifications, file uploads, and CSV export. Uses raw SQL with `pg` pool – no Prisma or TypeScript.

## Features

- JWT authentication with admin role
- Lead creation (public) with optional file upload
- Email notification (Resend) to admin on new lead
- WhatsApp deep‑link generation
- Admin endpoints: lead listing, filtering, status update
- CSV export of all leads
- Rate limiting, validation, logging, error handling
- Raw PostgreSQL queries via `pg` Pool

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account (for file uploads)
- Resend account (for email)

## Installation

1. Clone the repository and navigate to `backend/`.
2. Install dependencies:
   ```bash
   npm install