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

## web Application

## Login 
<img width="1732" height="908" alt="image" src="https://github.com/user-attachments/assets/8245f65f-7988-416b-b096-40eacd677901" />

## Register
<img width="1738" height="908" alt="image" src="https://github.com/user-attachments/assets/a2d0f9f3-f4df-4396-98dc-d9048685a15f" />

## Customer Dashboard 
Home

<img width="1733" height="907" alt="image" src="https://github.com/user-attachments/assets/eeaf1c36-ea2f-4f9e-aa2d-20938a1ec9ec" />

Vehicle details

<img width="1730" height="894" alt="image" src="https://github.com/user-attachments/assets/e192ab94-6813-482a-914c-4d4684aba5c3" />

<img width="1739" height="909" alt="image" src="https://github.com/user-attachments/assets/aa8122cf-20ef-414e-a77e-db5205f11356" />

<img width="1735" height="906" alt="image" src="https://github.com/user-attachments/assets/731691f4-7e5b-4ede-bcfd-b2862ef2fe03" />

Booking flow

<img width="1743" height="900" alt="image" src="https://github.com/user-attachments/assets/1868df8e-9938-40ac-b303-78424532b91a" />

Payment

<img width="1781" height="902" alt="image" src="https://github.com/user-attachments/assets/e82b02cc-d544-48b6-b25d-ec851f446bb0" />

<img width="1735" height="909" alt="image" src="https://github.com/user-attachments/assets/0083aa39-60bf-48f1-9316-dd133bd57617" />

Booking history

<img width="1727" height="911" alt="image" src="https://github.com/user-attachments/assets/1bbadcf0-b734-4ce4-ae6c-7674ccb71c71" />


<img width="1733" height="826" alt="image" src="https://github.com/user-attachments/assets/71837772-09dd-4fe5-8f09-4aca816af075" />

Payment History

<img width="1741" height="908" alt="image" src="https://github.com/user-attachments/assets/9ac7c174-fea3-4ae9-8fbb-34ce23a87ecc" />

feedback

<img width="1732" height="508" alt="image" src="https://github.com/user-attachments/assets/098205ff-3d38-4540-b0f4-0fd946d5839c" />

<img width="1741" height="912" alt="image" src="https://github.com/user-attachments/assets/ecab3301-4fbd-413c-a0ea-eb8626089bee" />

<img width="1741" height="911" alt="image" src="https://github.com/user-attachments/assets/c46b0468-6e60-45d5-8d3f-9b6cab38e2e2" />

Edit profile
<img width="1742" height="908" alt="image" src="https://github.com/user-attachments/assets/ac82b42b-6b18-4e48-8743-8e13cbe301e5" />

## Staff Dashboard

<img width="1748" height="904" alt="image" src="https://github.com/user-attachments/assets/6d83a818-e8d2-4eed-b3bf-3ac00a4f5cb6" />
<img width="1736" height="916" alt="image" src="https://github.com/user-attachments/assets/59d73aab-d459-4402-b551-5c8b1fe481ac" />

vehicle Details
<img width="1740" height="910" alt="image" src="https://github.com/user-attachments/assets/ccab31a1-9a6b-4fb9-8e57-d2d5da08be6a" />

Manage Vehicle
<img width="1742" height="905" alt="image" src="https://github.com/user-attachments/assets/aaae7a98-536b-4470-87df-4928e5ea1278" />

<img width="1746" height="910" alt="image" src="https://github.com/user-attachments/assets/6c183675-d5b0-4e58-aa8e-f61089dc5558" />

Booking approval / status update
<img width="1754" height="860" alt="image" src="https://github.com/user-attachments/assets/de911b83-5d0b-47ac-8991-242dfb0e0b25" />

<img width="1740" height="887" alt="image" src="https://github.com/user-attachments/assets/a39c19d5-2e1e-400f-b544-ac0719427c58" />

Vehicle return
<img width="1737" height="903" alt="image" src="https://github.com/user-attachments/assets/4d14bbc6-3100-437d-b60e-5aacc8f74b9f" />

## Admin Dashboard
<img width="1745" height="772" alt="image" src="https://github.com/user-attachments/assets/c44b92f2-b91f-4877-9922-39de346937bd" />

<img width="1752" height="828" alt="image" src="https://github.com/user-attachments/assets/2bcf4478-39ba-4347-bb82-c532c97eb784" />

<img width="1721" height="903" alt="image" src="https://github.com/user-attachments/assets/1054a057-9462-4c6e-8764-ebd6f1546685" />

Booking management
<img width="1739" height="912" alt="image" src="https://github.com/user-attachments/assets/134dbf15-a81c-4c28-811d-4a3d80324a82" />
Payment management
<img width="1766" height="907" alt="image" src="https://github.com/user-attachments/assets/bcddd255-a0b8-4340-8210-0dfcc9a131ff" />
Vehicle management
<img width="1741" height="910" alt="image" src="https://github.com/user-attachments/assets/7b5b332e-fee0-4ce1-b072-9e822671e54e" />
Review management
<img width="1745" height="908" alt="image" src="https://github.com/user-attachments/assets/b5cc101e-9128-4e56-ab81-063a8751557d" />
<img width="1737" height="904" alt="image" src="https://github.com/user-attachments/assets/5410be61-5e39-44d7-8e78-a56a61c15c98" />

User management
<img width="1741" height="757" alt="image" src="https://github.com/user-attachments/assets/c225be64-92e3-4cc5-b75e-5e872f0b84fc" />

<img width="1741" height="911" alt="image" src="https://github.com/user-attachments/assets/730e1250-de62-4599-82c3-0e951271e919" />

Customer ID verification
<img width="1743" height="910" alt="image" src="https://github.com/user-attachments/assets/63d5879e-34c4-4ddc-abd1-ffd3aa412d1b" />

<img width="1757" height="900" alt="image" src="https://github.com/user-attachments/assets/44a0368a-c670-47b8-9eb6-9d123bf6fd86" />

New Registrations
<img width="1757" height="903" alt="image" src="https://github.com/user-attachments/assets/3327d8db-fdae-4867-a8da-b8dd67841c45" />


Promotional / discount management
<img width="1748" height="753" alt="image" src="https://github.com/user-attachments/assets/cb36378c-10ec-4120-ad42-61cf2b151520" />
Edit profile
<img width="1739" height="899" alt="image" src="https://github.com/user-attachments/assets/336721f1-4a94-4757-8237-6413e2f01867" />

## Mobile Application
Login 
<img width="420" height="677" alt="image" src="https://github.com/user-attachments/assets/35fbf9f1-1a1e-4b4d-84ee-92a5a5c53d76" />

Register
<img width="720" height="1558" alt="image" src="https://github.com/user-attachments/assets/211cd7c8-c88f-43fb-bf23-51dd5e28f14c" /> <img width="720" height="1558" alt="image" src="https://github.com/user-attachments/assets/31647a63-400c-45e6-bb10-6f651f75b49b" />

Customer Dashboard
<img width="720" height="1474" alt="image" src="https://github.com/user-attachments/assets/54a9f833-12cb-4d46-8604-8c9e60fd061e" />

Available Vehicles
<img width="720" height="1466" alt="image" src="https://github.com/user-attachments/assets/73f6c4bf-8fba-467b-93a3-1445b8ddad4a" />

Vehicle Details
<img width="720" height="1449" alt="image" src="https://github.com/user-attachments/assets/1205663e-8f82-4b0c-aa9f-c398eb68882a" />
<img width="720" height="1558" alt="image" src="https://github.com/user-attachments/assets/3316136c-327c-48dc-8e1c-0cccf0a01d13" />
<img width="720" height="1563" alt="image" src="https://github.com/user-attachments/assets/5bf02bbb-7583-4359-8324-fa9442fd7b78" />

Booking vehicle
<img width="720" height="1557" alt="image" src="https://github.com/user-attachments/assets/031030e0-0e24-4637-a931-418eeff8caa5" />
<img width="720" height="1419" alt="image" src="https://github.com/user-attachments/assets/bb50a638-71f1-45f1-8e85-c5063864a9a0" />

Payment
<img width="720" height="1561" alt="image" src="https://github.com/user-attachments/assets/cef6b4d0-7850-409c-a562-c8c94b8020c6" />
<img width="720" height="1363" alt="image" src="https://github.com/user-attachments/assets/cb55fab3-75e2-44e0-9a0a-d9a29129d691" />
<img width="720" height="1433" alt="image" src="https://github.com/user-attachments/assets/ed493f9b-2598-4c80-acb0-70d8ee5ebd14" />

Booking History
v<img width="220" height="1554" alt="image" src="https://github.com/user-attachments/assets/b478ab23-242d-44ac-82c4-b40b35ed64e6" />

Review / Comments
<img width="720" height="1464" alt="image" src="https://github.com/user-attachments/assets/a08079e6-0780-4c86-9e87-13c9d6b1304e" />

Profile
<img width="720" height="1563" alt="image" src="https://github.com/user-attachments/assets/4c294dc2-7773-421b-949e-925808c566c9" />

Edit Profile
<img width="720" height="1554" alt="image" src="https://github.com/user-attachments/assets/7636b795-d91f-4e8c-9e69-0a853c8261e7" />
<img width="720" height="1463" alt="image" src="https://github.com/user-attachments/assets/a0737739-d89c-48ee-8979-fdeeba00e545" />


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
