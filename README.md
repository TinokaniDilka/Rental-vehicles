# QuickRide 🚗

QuickRide is a full-stack vehicle rental platform with three connected pieces: a **Node.js/Express/MongoDB backend**, a **React web app** (customer/staff/admin), and a **React Native (Expo) mobile app**. It supports three roles — **admin**, **staff**, and **customer** — with bookings, payments, vehicle management, reviews, and real-time updates.

## ✨ Features

- **Role-based access** — separate flows and dashboards for admin, staff, and customers
- **Vehicle booking & returns** — browsing, booking, two-step vehicle handover/return flow
- **Payments** — Stripe integration (card payments) with commission handling
- **Customer ID verification** — document upload, admin approval, booking gate
- **Cancellation & refund policy** — automatic partial refund on cancellation
- **Real-time sync** — Socket.IO powers live updates across web dashboards
- **Auth** — JWT-based authentication with a Gmail SMTP OTP flow for password resets
- **Profile management** — photo upload across web and mobile
- **Reviews & feedback** — customer ratings and feedback system
- **Admin tools** — stat cards, reporting pages, verification alerts, audit logging
- **Promo codes / discounts**

## 🏗️ Tech Stack

| Layer | Stack |
|---|---|
| Backend | Node.js, Express 5, MongoDB (Mongoose), Socket.IO, JWT, Multer, Nodemailer, Stripe, node-cron |
| Web frontend | React 19, React Router 7, Axios |
| Mobile app | React Native 0.81 (Expo 54), React Navigation, Expo Image Picker, Stripe React Native |

## 📁 Project Structure

```
new/
├── backend/            # Express API + MongoDB models
│   ├── config/         # DB connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, upload, etc.
│   ├── models/         # Mongoose schemas (User, Vehicle, Booking, Payment, Feedback, Promo, AuditLog)
│   ├── routes/         # API route definitions
│   ├── jobs/ tasks/    # Scheduled jobs (e.g. overdue booking checks)
│   ├── uploads/        # Uploaded files (profile photos, ID docs)
│   └── server.js       # App entry point
├── web-frontend/       # React web app (admin / staff / customer)
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
└── mobile-app/         # Expo React Native app
    ├── Alerts/ Booking/ Home/ Payment/ Profile/ Staff/ Vehicles/
    ├── components/ context/ navigation/ screens/
    ├── services/        # API client + service modules
    └── utils/           # Constants, helpers
```

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS) and npm
- A MongoDB Atlas cluster (or local MongoDB instance)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) (for OTP emails)
- A Stripe account (test keys are fine for development)
- Expo CLI (`npm install -g expo-cli`) for the mobile app, or just `npx expo`

### 1. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
STRIPE_SECRET_KEY=your_stripe_secret_key
COMMISSION_RATE=your_commission_rate

# OTP Email (Gmail)
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

Run the server:

```bash
npm run dev     # nodemon, auto-restart
# or
npm start
```

The API runs on `http://localhost:5000` by default.

### 2. Web frontend setup

```bash
cd web-frontend
npm install
npm start
```

Runs on `http://localhost:3000`. Update the API base URL in `src/services` if your backend isn't on `localhost:5000`.

### 3. Mobile app setup

```bash
cd mobile-app
npm install
npx expo start
```

Update `API_BASE_URL` in `mobile-app/utils/constants.js` to point to your machine's LAN IP (not `localhost`) so a physical device or emulator can reach the backend, e.g.:

```js
export const API_BASE_URL = 'http://<your-local-ip>:5000';
```

## 🔌 API Overview

| Route | Purpose |
|---|---|
| `/api/auth` | Registration, login, OTP/password reset |
| `/api/vehicles` | Vehicle listing & management |
| `/api/bookings` | Booking creation, returns, cancellations |
| `/api/payments` | Stripe payment processing |
| `/api/promos` | Discount/promo codes |
| `/api/feedback` | Reviews & feedback |
| `/api/dashboard` | Admin/staff dashboard stats & reports |

## 🧩 Challenges Faced During Development

Building QuickRide across three platforms surfaced a number of real-world integration problems:

- **MongoDB Atlas connectivity** — intermittent connection issues had to be diagnosed and resolved between the backend and Atlas cluster.
- **Mobile API URL duplication bugs** — the mobile app's base URL configuration led to duplicated path segments in requests, requiring a fix in `services/api.js` / `utils/constants.js`.
- **Stale cached data on mobile** — customer verification status appeared outdated on screen because data wasn't refreshed when a screen regained focus; solved by adopting `useFocusEffect` to re-fetch on focus instead of only on mount.
- **Booking data inconsistencies** — mismatched field names between frontend and backend caused bookings to display incorrect values, including totals showing as `LKR 0`.
- **Cross-platform real-time sync** — keeping web dashboards (admin/staff) in sync required introducing Socket.IO rather than relying on polling.
- **Role-based data scoping** — staff accounts needed vehicles/bookings filtered to only what they own, which required scoping logic across multiple existing endpoints rather than a single new route.
- **Incomplete Stripe integration on mobile** — card payment flow was started but left incomplete pending live API keys, and currently only supports USD, which doesn't match the target Sri Lankan market (see Known Issues below).
- **Security gaps surfaced by internal audit** — a self-run audit uncovered plaintext password storage, a hardcoded JWT fallback secret, unauthenticated static serving of uploaded verification documents, and full request-body logging that could leak credentials — all now tracked as fixes rather than being silently shipped.

## ⚠️ Known Issues / Roadmap

- **Passwords are currently stored in plain text** — bcrypt hashing is pending and should be treated as a priority before any real deployment.
- **Payment gateway currently hardcodes USD via Stripe** — since the target market is Sri Lanka, migrating to (or adding) **PayHere** for LKR support is recommended.
- Request/response logging middleware in `server.js` currently logs full headers and bodies, which can leak credentials/tokens in server logs — recommend scrubbing sensitive fields or disabling in production.
- JWT secret handling and static file serving for uploaded verification documents should be reviewed for hardcoded fallbacks and authentication gaps.
- No rate limiting is currently applied to auth endpoints.

## 🏗 System Modules

- Authentication Module (JWT + OTP password reset)
- Customer Module (browsing, booking, profile, ID verification)
- Vehicle Management Module
- Booking & Return Module (two-step handover)
- Payment Module (Stripe)
- Feedback / Review Module
- Admin Dashboard & Reporting Module
- Staff Module (scoped vehicle/booking management)

## 📷 Screenshots

_Add screenshots here, e.g.:_

```
screenshots/
  home.png
  vehicle-list.png
  booking-flow.png
  admin-dashboard.png
  mobile-home.png
  mobile-booking.png
```

## 🎯 Future Enhancements

- Switch to bcrypt password hashing (currently plaintext — see Known Issues)
- Add PayHere as the primary payment gateway for LKR support
- Push notifications on mobile for booking status updates
- Rate limiting on auth endpoints
- Automated tests for backend routes
- CI/CD pipeline for deployment

## 📖 Learning Outcomes

This project demonstrates practical experience in:

- Full-stack development across web and mobile (Node/Express, React, React Native/Expo)
- MongoDB/Mongoose schema design
- JWT-based authentication and role-based access control
- Real-time updates with Socket.IO
- Third-party payment integration (Stripe)
- Debugging cross-platform data sync issues
- Running a self-directed security/feature-gap audit

## 🤝 Contributing

This is currently a solo & academic project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/NewFeature`
3. Commit your changes: `git commit -m "Added new feature"`
4. Push the branch: `git push origin feature/NewFeature`
5. Open a Pull Request

## 👨‍🎓 Author

**Dilka**
IT Undergraduate — QuickRide built as a hands-on full-stack learning project 


## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.
