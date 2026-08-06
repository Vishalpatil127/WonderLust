# Wonderlust

Wonderlust is a production-ready Airbnb-style listing application with Express.js, MongoDB, JWT authentication, role-based access control, bookings, wishlist support, and a React frontend.

## Features

- MVC architecture with controllers, routes, models, services, middleware, and utils
- JWT access/refresh authentication
- Role-based authorization for `admin`, `host`, and `customer`
- Booking system with overlap prevention
- Wishlist support
- Email OTP reset flow
- CORS, helmet, rate limiting, XSS hardening, and Mongo sanitization
- Swagger API documentation
- Winston logging
- Redis-ready configuration
- Cloudinary-ready image uploads
- Razorpay-ready payment integration
- Docker-ready setup

## Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- React + Vite
- JWT
- Redis
- Cloudinary
- Razorpay
- Swagger
- Jest

## Getting Started

1. Install dependencies:
   npm install
2. Create your environment variables in `.env`.
3. Start the API:
   npm run dev
4. Start the client:
   npm run client

## Environment Variables

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CLIENT_URL`
- `NODE_ENV`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `REDIS_URL`

## Deployment

The project is structured for deployment on Render or Railway with environment-based configuration.
