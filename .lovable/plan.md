

# Land Marketplace -- Implementation Plan

## Tech Stack (Adapted for Lovable)

| Original | Adapted |
|----------|---------|
| Next.js | React + Vite + React Router |
| Appwrite Auth | Supabase Auth |
| Appwrite Database | Supabase Database (PostgreSQL) |
| Appwrite Storage | Supabase Storage |
| Razorpay | Stripe (via Lovable's built-in integration) |
| Vercel | Lovable hosting |

All features from your spec will be preserved -- only the underlying services change.

## Implementation Phases

### Phase 1: Foundation and Auth
- Set up Supabase (Cloud) for auth, database, and storage
- Create signup/login pages with email verification
- Profile completion page (full name, phone, country, state, city, village/area)
- Auto-create profile on signup via database trigger
- Protected routes and auth context

### Phase 2: Database Schema
- **profiles**: name, phone, country, state, city, village, role (user/admin)
- **user_roles**: role-based access (admin, user) using security definer pattern
- **listings**: title, description, price, location fields, land_size, land_size_unit, land_type, google_maps_link, phone, whatsapp, status (pending/approved/rejected/sold), user_id
- **listing_images**: listing_id, image_url (1-3 images per listing)
- **subscriptions**: user_id, plan_name, payment_id, start_date, expiry_date
- **reports**: listing_id, reporter_id, reason, created_at
- RLS policies for all tables

### Phase 3: Subscription System (Stripe)
- Enable Stripe integration
- Three plans: Free (1 listing), Pro ($2.39/mo ~ ₹199, 10 listings), Business ($5.99/mo ~ ₹499, 50 listings)
- Enforce listing limits before creating new listings
- Store subscription details in database
- Webhook to handle payment confirmation

### Phase 4: Listing System
- Create listing form with all required fields
- Image upload (1-3 images) to Supabase Storage bucket
- Listing moderation: new listings default to "pending"
- Edit/delete own listings
- Slot recovery on deletion

### Phase 5: Browse and Search
- Browse page with grid of approved listings
- Filters: country, state, city, village, price range, land size, land type
- Sorting: newest, price asc/desc, largest size
- Responsive card layout

### Phase 6: Listing Detail Page
- Full listing info with image gallery
- Call Seller, WhatsApp Seller, View on Google Maps buttons
- Report listing modal

### Phase 7: Admin Dashboard
- View/approve/reject/delete pending listings
- View reported listings and take action
- Ban users

### Phase 8: UI Polish and Pages
- Professional SaaS home page with hero, featured lands, how it works, plans, footer
- User dashboard with my listings, subscription status
- Profile management page
- Mobile responsive throughout
- Smooth animations and modern design

## Pages

`/` Home | `/browse` Browse Lands | `/listing/:id` Details | `/add-listing` Create | `/login` `/signup` Auth | `/complete-profile` Profile Setup | `/dashboard` User Dashboard | `/my-listings` User Listings | `/profile` Edit Profile | `/pricing` Plans | `/admin` Admin Dashboard

## Design Direction

Clean SaaS aesthetic with earth-tone accent colors (greens/browns for land theme), rounded cards, subtle shadows, consistent spacing, professional typography. Mobile-first responsive layout.

