# TARAKH STORE - Setup & Installation Guide

## 🎮 Tentang Project

TARAKH STORE adalah aplikasi web untuk top-up game dengan integrasi Midtrans sebagai payment gateway. Aplikasi ini memiliki:
- Homepage dengan katalog game
- Halaman detail game dengan pilihan paket
- Payment gateway Midtrans (QRIS, GoPay, Bank Transfer)
- Admin dashboard untuk manajemen game, paket, dan transaksi
- Database PostgreSQL via Neon

## 📋 Prerequisites

- Node.js 18+ dan npm/yarn
- Database PostgreSQL (Neon)
- Akun Midtrans untuk payment gateway
- Email yang aktif (untuk testing)

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
npm install
# atau
yarn install
```

### 2. Setup Environment Variables

Buat file `.env.local` di root project:

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# Midtrans
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=YOUR_MIDTRANS_CLIENT_KEY
MIDTRANS_SERVER_KEY=YOUR_MIDTRANS_SERVER_KEY

# JWT
JWT_SECRET=your-secret-key-for-jwt-tokens
```

### 3. Setup Database

Run SQL scripts untuk setup tables:

```bash
# 1. Create game tables
psql -U user -d dbname -f scripts/create-game-tables.sql

# 2. Insert demo data
psql -U user -d dbname -f scripts/seed-game-data.sql

# 3. Create admin table
psql -U user -d dbname -f scripts/create-admin-table.sql

# 4. Insert admin user (mahfud@yopmail.com / 123456)
psql -U user -d dbname -f scripts/insert-admin-mahfud.sql
```

### 4. Run Development Server

```bash
npm run dev
# atau
yarn dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🔑 Admin Login

**Demo Account:**
- Email: `mahfud@yopmail.com`
- Password: `123456`

Admin dashboard: `http://localhost:3000/admin`

## 🎯 Fitur Utama

### User Features
1. **Browse Games** - Lihat katalog game yang tersedia
2. **Game Details** - Lihat paket top-up untuk setiap game
3. **Checkout** - Isi user ID dan server ID (untuk ML)
4. **Payment** - Proses pembayaran via Midtrans

### Admin Features
1. **Dashboard** - Overview statistik transaksi
2. **Games Management** - Tambah/edit/hapus game
3. **Packages Management** - Kelola paket top-up per game
4. **Transactions** - Monitor status transaksi
5. **Settings** - Edit profil dan ganti password

## 📦 Project Structure

```
├── app/
│   ├── page.tsx              # Homepage
│   ├── game/[gameId]/        # Game detail page
│   ├── admin/                # Admin dashboard
│   └── api/                  # API routes
├── components/               # Reusable components
├── lib/                      # Utility functions & database
├── scripts/                  # SQL migration scripts
└── public/                   # Static assets
```

## 🔌 API Endpoints

### Games
- `GET /api/games` - List all active games
- `GET /api/games/[gameId]/packages` - Get packages for game

### Payment
- `POST /api/payment` - Create payment transaction
- `POST /api/webhook/midtrans` - Midtrans webhook handler

### Admin
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout
- `GET /api/admin/games` - List games (admin)
- `POST /api/admin/games` - Create game
- `PUT /api/admin/games/[gameId]` - Update game
- `DELETE /api/admin/games/[gameId]` - Delete game
- `GET /api/admin/transactions` - List transactions
- `GET /api/admin/stats` - Dashboard statistics

## 🧪 Testing

### Test Payment Flow
1. Go to `http://localhost:3000`
2. Click on a game
3. Select package
4. Fill user ID (and server ID for ML)
5. Click "Bayar Sekarang"
6. Use Midtrans test credentials

### Midtrans Test Credentials
- Credit Card: `4811 1111 1111 1114`
- CVV: `123`
- Expiry: `12/25`

## 🛠️ Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:** 
- Check DATABASE_URL is correct
- Verify database is running
- Check firewall/network access

### Midtrans Payment Not Loading
```
Error: snap.pay is not a function
```
**Solution:**
- Check NEXT_PUBLIC_MIDTRANS_CLIENT_KEY is set
- Clear browser cache
- Check Midtrans script is loaded in head

### Admin Login Failed
```
Error: Email atau password salah
```
**Solution:**
- Check email is `mahfud@yopmail.com`
- Check password is `123456`
- Check admin table exists in database

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build          # Build for production
npm start              # Run production server

# Database
npm run db:migrate     # Run migrations
npm run db:reset       # Reset database

# Testing
npm run test           # Run tests
npm run lint           # Run linter
```

## 🚀 Deployment

### To Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables on Vercel
Set these in Vercel project settings:
- DATABASE_URL
- MIDTRANS_SERVER_KEY
- NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
- JWT_SECRET

## 📞 Support

Untuk bantuan atau masalah, hubungi support atau buat issue di repository.

## 📄 License

© 2026 TARAKH STORE. All rights reserved.
