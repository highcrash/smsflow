---
name: smsflow-web
description: Build the SMSFlow SaaS web platform - Next.js dashboard + NestJS API + PostgreSQL + Stripe billing + WordPress plugin
user_invocable: true
---

# SMSFlow Web Platform Builder

You are building the **SMSFlow SaaS Web Platform** at `D:\SMSGATEWAY\smsflow-web\`.

## Brand Design Tokens (from D:\SMSGATEWAY\brand-guide.html)

### Tailwind Color Tokens
```javascript
colors: {
  brand: {
    50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7',
    400: '#34D399', 500: '#10B981', 600: '#059669', 700: '#047857', 800: '#065F46'
  },
  surface: {
    pure: '#FFFFFF', soft: '#F9FAFB', warm: '#F3F4F6', cool: '#E5E7EB', muted: '#D1D5DB'
  },
  dark: {
    400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151',
    800: '#1F2937', 900: '#111827'
  },
  success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6'
}
```

### Typography: Inter (sans) + JetBrains Mono (mono) from Google Fonts
### Spacing: 4px base unit
### Border Radius: sm=6px, md=10px, lg=16px, xl=24px, full=9999px
### Shadows: sm, md, lg, xl + green glow (0 4px 14px rgba(16,185,129,0.25))
### Color Ratio: 70% white, 10% green accents, 20% dark

## Tech Stack
- **Frontend**: Next.js 14+ (App Router, TypeScript)
- **Backend API**: NestJS 10+ (TypeScript)
- **Database**: PostgreSQL 16 with **Prisma 5+**
- **Cache**: Redis 7+
- **Auth**: NextAuth.js v5 + JWT
- **Payments**: Stripe (Checkout, Billing Portal, Webhooks)
- **Real-time**: Socket.io 4+
- **UI**: Tailwind CSS 3 + Radix UI primitives + custom brand components
- **Charts**: Recharts
- **Tables**: TanStack Table v8
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand (client) + TanStack React Query (server)
- **File Parse**: xlsx (SheetJS) for Excel/CSV import
- **Email**: Resend
- **Monorepo**: pnpm + Turborepo

## Folder Structure
```
smsflow-web/
├── apps/
│   ├── web/                               # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/                    # Login, register, forgot-password, verify-email
│   │   │   │   └── layout.tsx             # Centered card layout, no sidebar
│   │   │   ├── (dashboard)/               # All dashboard pages
│   │   │   │   ├── layout.tsx             # Sidebar + topbar layout
│   │   │   │   ├── page.tsx               # Overview: stats cards, volume chart, recent messages, device status
│   │   │   │   ├── send/page.tsx          # Single SMS: phone input, textarea (160 counter), template dropdown, device selector
│   │   │   │   ├── send/bulk/page.tsx     # Bulk: upload Excel/CSV, select group, template mapping, progress bar
│   │   │   │   ├── messages/page.tsx      # Data table: recipient, preview, status badge, device, time
│   │   │   │   ├── messages/[id]/page.tsx # Detail: body, status timeline, device/SIM, error, retry button
│   │   │   │   ├── contacts/page.tsx      # Table + import button + create dialog + group filter tabs
│   │   │   │   ├── contacts/groups/page.tsx
│   │   │   │   ├── templates/page.tsx     # Card grid + editor with {{variable}} highlighting + preview
│   │   │   │   ├── templates/[id]/page.tsx
│   │   │   │   ├── devices/page.tsx       # Device cards + "Add Device" QR dialog
│   │   │   │   ├── devices/[id]/page.tsx
│   │   │   │   ├── api-keys/page.tsx      # Table + create with permissions + one-time key display
│   │   │   │   ├── webhooks/page.tsx      # Table + create/edit + delivery logs + test button
│   │   │   │   ├── webhooks/[id]/page.tsx
│   │   │   │   ├── analytics/page.tsx     # Line/bar/pie charts, delivery rate trend, date picker, CSV export
│   │   │   │   ├── billing/page.tsx       # Current plan + usage meter + upgrade + Stripe Portal link
│   │   │   │   ├── billing/invoices/page.tsx
│   │   │   │   └── settings/page.tsx      # Profile, timezone, notifications, danger zone
│   │   │   ├── (admin)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── admin/page.tsx         # Total users/devices/SMS/revenue, recent signups
│   │   │   │   ├── admin/users/page.tsx   # User table with search/filter/suspend
│   │   │   │   ├── admin/devices/page.tsx
│   │   │   │   ├── admin/subscriptions/page.tsx
│   │   │   │   └── admin/logs/page.tsx
│   │   │   ├── (marketing)/
│   │   │   │   ├── layout.tsx             # Public header/footer
│   │   │   │   ├── page.tsx               # Landing page (hero, features, pricing, CTA)
│   │   │   │   ├── pricing/page.tsx
│   │   │   │   ├── docs/page.tsx          # API documentation
│   │   │   │   ├── docs/[slug]/page.tsx
│   │   │   │   ├── wordpress/page.tsx     # WP plugin docs
│   │   │   │   └── changelog/page.tsx
│   │   │   ├── api/
│   │   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   │   ├── stripe/webhook/route.ts
│   │   │   │   └── upload/route.ts
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/ (button, input, select, card, badge, dialog, dropdown-menu, table, tabs, toast, tooltip, pagination, skeleton, data-table)
│   │   │   ├── layout/ (sidebar, topbar, mobile-nav, breadcrumbs)
│   │   │   ├── dashboard/ (stats-cards, activity-chart, recent-messages, device-status-card)
│   │   │   ├── messages/ (send-form, bulk-send-form, message-table, message-detail)
│   │   │   ├── devices/ (device-card, pair-device-dialog, device-detail)
│   │   │   ├── contacts/ (contact-table, import-dialog, group-manager)
│   │   │   ├── templates/ (template-editor, template-preview)
│   │   │   ├── billing/ (plan-selector, usage-meter, invoice-table)
│   │   │   └── shared/ (logo, empty-state, error-boundary, loading-spinner, copy-button)
│   │   ├── hooks/ (use-device-status, use-messages, use-subscription, use-debounce)
│   │   ├── lib/ (api-client, auth, stripe, socket, utils, constants, validators)
│   │   ├── stores/ (device-store, ui-store)
│   │   ├── types/ (api, message, device, user, subscription)
│   │   ├── tailwind.config.ts
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   └── api/                               # NestJS backend
│       └── src/
│           ├── main.ts
│           ├── app.module.ts
│           ├── common/
│           │   ├── guards/ (auth, roles, api-key, rate-limit)
│           │   ├── decorators/ (current-user, roles, api-key)
│           │   ├── interceptors/ (logging, transform)
│           │   ├── filters/ (http-exception)
│           │   ├── pipes/ (validation)
│           │   └── dto/ (pagination, api-response)
│           ├── modules/
│           │   ├── auth/ (controller, service, JWT/Google/GitHub strategies, DTOs)
│           │   ├── users/ (controller, service, DTOs)
│           │   ├── devices/ (controller, service, gateway, DTOs)
│           │   ├── messages/ (controller, service, Bull queue processor, DTOs)
│           │   ├── contacts/ (controller, service, DTOs)
│           │   ├── templates/ (controller, service, DTOs)
│           │   ├── webhooks/ (controller, service, DTOs)
│           │   ├── api-keys/ (controller, service, DTOs)
│           │   ├── billing/ (controller, service, stripe.service, DTOs)
│           │   ├── analytics/ (controller, service)
│           │   ├── admin/ (controller, service)
│           │   └── notifications/ (service, email.service)
│           ├── gateway/
│           │   ├── ws.gateway.ts           # /devices + /dashboard namespaces
│           │   ├── ws.adapter.ts
│           │   └── ws.guard.ts
│           └── prisma/ (schema.prisma, service, module)
│
├── packages/
│   ├── shared/                            # Shared types, constants, phone utils
│   └── wordpress-plugin/smsflow-wp/
│       ├── smsflow-wp.php                 # Main plugin file
│       ├── includes/
│       │   ├── class-smsflow-api.php      # HTTP client (wp_remote_post/get)
│       │   ├── class-smsflow-admin.php    # Admin pages
│       │   ├── class-smsflow-shortcode.php # [smsflow_form] opt-in form
│       │   ├── class-smsflow-woocommerce.php # Order status SMS hooks
│       │   └── class-smsflow-notifications.php # WP event hooks
│       ├── admin/views/ (settings-page.php, send-sms-page.php)
│       └── readme.txt
│
├── docker-compose.yml                     # PostgreSQL 16 + Redis 7 + API + Web
├── docker-compose.dev.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── .env.example
```

## Database Schema (Prisma)

### Users & Auth
- **users**: id (cuid), email (unique), passwordHash, name, avatarUrl, role (USER/ADMIN/SUPER_ADMIN), emailVerified, timestamps
- **accounts**: OAuth provider accounts (Google, GitHub) linked to users

### Subscriptions & Billing
- **subscriptions**: userId (unique), stripeCustomerId, stripeSubscriptionId, planId, status (TRIAL/ACTIVE/PAST_DUE/CANCELED), smsUsedThisPeriod, smsLimit, deviceLimit, trialEndsAt, period dates
- **plans**: name, stripePriceId, price, interval, smsLimit, deviceLimit, features (JSON)
- **invoices**: subscriptionId, stripeInvoiceId, amount, status, invoiceUrl

### Devices
- **devices**: userId, name, model, osVersion, appVersion, simCount, simDetails (JSON), status (ONLINE/OFFLINE/PAIRING), lastSeenAt, batteryLevel, signalStrength, pairingToken (unique), accessTokenHash, refreshTokenHash, fcmToken, encryptionKey, isEnabled

### Messages
- **messages**: userId, deviceId, phoneNumber, body, status (PENDING/QUEUED/DISPATCHED/SENT/DELIVERED/FAILED), direction (INBOUND/OUTBOUND), simSlot, templateId, bulkBatchId, errorCode, scheduledAt, sentAt, deliveredAt, metadata (JSON). Indexes: [userId,createdAt], [userId,status], deviceId, bulkBatchId
- **bulk_batches**: userId, name, totalCount, sentCount, failedCount, status, templateId

### Contacts
- **contacts**: userId, phoneNumber, firstName, lastName, email, company, tags (string[]), metadata (JSON). Unique: [userId,phoneNumber]
- **contact_groups**: userId, name, color. Unique: [userId,name]
- **contact_group_members**: composite key [contactId, groupId]

### Config
- **templates**: userId, name, body ({{variable}} syntax), variables (string[]), category, isActive
- **api_keys**: userId, name, keyHash (SHA-256 unique), keyPrefix (first 8 chars like sf_...), permissions (string[]), lastUsedAt, expiresAt, isActive
- **webhooks**: userId, url, secret (HMAC), events (string[]: sms:sent, sms:delivered, sms:failed, sms:received), isActive
- **webhook_logs**: webhookId, userId, event, payload (JSON), statusCode, response, success

### Team
- **team_members**: userId (owner), email, role (admin/member/viewer), status (pending/active)

## REST API Endpoints (50+)

### Auth
POST /api/v1/auth/register, /login, /refresh, /forgot-password, /reset-password, /verify-email, /logout
GET /api/v1/auth/google, /google/callback, /github, /github/callback

### Users
GET/PATCH/DELETE /api/v1/users/me

### Devices
GET /api/v1/devices, POST /pair/generate (QR data), POST /pair (from Android)
GET/PATCH/DELETE /api/v1/devices/:id, POST /:id/ping

### Messages
POST /api/v1/messages (single), POST /bulk
GET /api/v1/messages (paginated, filterable by status/device/date)
GET /api/v1/messages/:id, DELETE /:id, POST /:id/retry

### Contacts
GET/POST /api/v1/contacts, POST /import (Excel/CSV multipart upload)
GET/PATCH/DELETE /api/v1/contacts/:id
GET/POST /api/v1/contacts/groups, PATCH/DELETE /groups/:id
POST/DELETE /api/v1/contacts/groups/:id/members

### Templates
GET/POST /api/v1/templates, GET/PATCH/DELETE /:id, POST /:id/preview

### API Keys
GET/POST /api/v1/api-keys (POST returns full key ONCE), DELETE /:id

### Webhooks
GET/POST /api/v1/webhooks, GET/PATCH/DELETE /:id
GET /:id/logs, POST /:id/test

### Analytics
GET /api/v1/analytics/overview, /messages, /delivery-rate, /devices, /export

### Billing
GET /api/v1/billing/subscription, POST /checkout, POST /portal
GET /invoices, GET /usage

### Admin (SUPER_ADMIN only)
GET /api/v1/admin/users, /users/:id, PATCH /users/:id
GET /admin/devices, /stats, /subscriptions, /logs

### Device-facing (called by Android app, auth via device access token)
POST /api/v1/device/heartbeat
POST /api/v1/device/messages/status
GET /api/v1/device/messages/pending
POST /api/v1/device/messages/received
POST /api/v1/device/token/refresh

## WebSocket Protocol (Socket.io)

### /devices namespace (server <-> Android app)
Server->Device: SEND_SMS {messageId, phoneNumber, body, simSlot}, PING, CONFIG_UPDATE
Device->Server: STATUS_UPDATE {messageId, status, errorCode}, HEARTBEAT {battery, signal, queueDepth}, SMS_RECEIVED {from, body, receivedAt}, PONG

### /dashboard namespace (server -> web browser)
DEVICE_STATUS {deviceId, status, battery}, MESSAGE_UPDATE {messageId, status}, NEW_RECEIVED_SMS {from, body, deviceId}, STATS_UPDATE {sentToday, deliveredToday}

Envelope: `{ "id": "<uuid>", "type": "<TYPE>", "timestamp": <ms>, "payload": {...} }`

## Stripe Integration
1. Register -> 14-day free trial (Starter features)
2. Upgrade -> POST /api/v1/billing/checkout -> Stripe Checkout Session
3. checkout.session.completed webhook -> create/update subscription record
4. invoice.payment_succeeded -> reset smsUsedThisPeriod, extend period
5. invoice.payment_failed -> PAST_DUE, restrict after 3 failures
6. Manage -> POST /api/v1/billing/portal -> Stripe Billing Portal redirect

## Subscription Plans
| Feature | Starter $9/mo | Pro $29/mo | Business $79/mo |
|---------|--------------|------------|-----------------|
| SMS/month | 500 | 5,000 | 25,000 |
| Devices | 1 | 3 | 10 |
| Contacts | 500 | 5,000 | Unlimited |
| Templates | 10 | 50 | Unlimited |
| Bulk SMS | No | Yes | Yes |
| WordPress | No | Yes | Yes |
| Analytics | Basic | Full | Full + Export |
| Team | 1 | 3 | 10 |

## Rate Limiting
Login: 5/15min, Register: 3/1hr
SMS: Starter 1/sec, Pro 5/sec, Business 20/sec
API reads: 100/min, writes: 30/min
Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

## Build Order
1. Monorepo scaffold (pnpm + Turborepo + shared package)
2. Docker Compose (PostgreSQL + Redis)
3. NestJS: Prisma schema + migrations + seeds
4. Auth module (register, login, JWT, OAuth)
5. Device module + WebSocket gateway
6. Message module + Bull queue
7. Next.js: Tailwind config with brand tokens + base UI components
8. Auth pages (login, register, forgot password, verify email)
9. Dashboard layout (sidebar + topbar) + overview page
10. Send SMS (single + bulk)
11. Messages list + detail
12. Contacts (CRUD + Excel import + groups)
13. Templates editor with {{variable}} support
14. Devices + QR pairing dialog
15. API Keys + Webhooks
16. Stripe billing integration
17. Analytics charts (Recharts)
18. Settings + Team management
19. Admin panel
20. WordPress plugin
21. API documentation pages (MDX)
22. Marketing pages (landing, pricing) using brand guide hero/features/pricing mockups
23. Rate limiting, error handling, logging middleware
24. Docker production build + .env.example

## Instructions
- Build every file completely - no placeholders, no TODOs
- Follow the brand guide design system exactly (colors, typography, shadows, radius, component styles)
- The sidebar must match the brand guide's dark sidebar pattern (#111827 background)
- All UI components must be custom-built to match brand-guide.html specimens
- Use the same button variants (primary green, secondary dark, outline, ghost, disabled)
- Dashboard widgets must match brand guide: stats cards, device list, recent messages, subscription status
- Marketing pages must match the hero/features/pricing mockups from brand guide
- Handle all edge cases and provide proper error states
- Include proper loading skeletons for all data-fetching pages
