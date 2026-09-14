# WAVELENGTH — Music Intelligence & Database Studio

> A commercial-grade music intelligence and database operations console built for academic DBMS project demonstration and production REST/SQL backend integration.
> 
> Inspired by **Spotify × Supabase × Linear × Modern Database IDEs**.

---

## Overview

**Wavelength** is a streaming platform administration and data intelligence suite. It allows platform administrators, database engineers, and analytics teams to monitor catalogue ingestion, manage relational entities, test queries in an interactive SQL IDE, and inspect BCNF entity-relationship topologies.

### Core Highlights
* **Zero Schema Drift**: 100% compliant with all 11 database entities, exact column names, data types, single primary keys, and composite primary keys.
* **Dual Execution Mode**:
  * **Demo Mode**: Instant out-of-the-box operation with factory seed data and an in-browser single-table & join SQL engine. No server required.
  * **Live Mode**: Switches with a single click to talk directly to your team's live REST API (`http://localhost:5000/api`) and raw SQL endpoint (`POST /query`).
* **Reusable CRUD Engine**: Centralized schema definition drives tables, search bars, multi-column filters, right-side slide-out record drawers, and modal deletion prompts.
* **SQL Studio**: Lightweight database IDE with formatting, query history, keyboard shortcuts (`Ctrl+Enter`), execution timing (`ms`), row count telemetry, and CSV/JSON export.
* **Interactive ER Diagram**: Complete visual topology highlighting `🔑 Primary Keys`, `🔗 Foreign Keys`, composite keys, and directional relationships.
* **Backend Integration Center**: Live interactive endpoint inspector and one-click cURL/Fetch snippet generator for backend teammates.

---

## Database Architecture (11 Entities)

The schema enforces Boyce-Codd Normal Form (BCNF) relationships across 3 primary domains:

```text
[MUSIC]
Artists (AR) ──< Albums (AL) ──< Songs (SG)
Users (U) ─────< Playlists (PL)

[PODCASTS]
Podcast Creators (PC) ──< Podcasts (PD) ──< Episodes (Composite: Podcast_ID + Episode_No)

[ACCOUNTS]
Users (U) ──< Subscriptions (SUB) ──< Payments (PAY)
Users (U) ──< Devices (DEV)
```

### Entity Specifications

| Table | Primary Key | Foreign Key References | Description |
| :--- | :--- | :--- | :--- |
| **Users** | `User_ID` | — | Platform listener profiles and account credentials. |
| **Artists** | `Artist_ID` | — | Recording artists, bands, and contributing producers. |
| **Albums** | `Album_ID` | `Artist_ID` → `Artists` | Curated musical releases, EPs, and singles. |
| **Songs** | `Song_ID` | `Album_ID` → `Albums` | Master track catalogue with duration, language, and release date. |
| **Playlists** | `Playlist_ID` | `User_ID` → `Users` | User-created listening collections (Public/Private). |
| **Podcast Creators** | `Creator_ID` | — | Show hosts, audio journalists, and executive producers. |
| **Podcasts** | `Podcast_ID` | `Creator_ID` → `Podcast Creators` | Audio series, broadcast feeds, and talk shows. |
| **Episodes** | `[Podcast_ID, Episode_No]` *(Composite)* | `Podcast_ID` → `Podcasts` | Individual episodic releases under a parent podcast. |
| **Subscriptions** | `Subscription_ID` | `User_ID` → `Users` | Tiered access agreements (Free, Premium, Family, Student). |
| **Payments** | `Payment_ID` | `Subscription_ID` → `Subscriptions` | Gateway transactions (Card, UPI, Wallet, Netbanking). |
| **Devices** | `Device_ID` | `User_ID` → `Users` | Active streaming endpoints (iOS, Android, macOS, Windows). |

---

## Project Structure

```text
wavelength/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx           # Collapsible responsive navigation with live counts
│   │   │   ├── Topbar.jsx            # Status pill, live mode indicator, quick jump
│   │   │   ├── PageHeader.jsx        # Standardized page title, badge & actions
│   │   │   └── ConnectionModal.jsx   # Interactive backend URL test & switch dialog
│   │   ├── dashboard/
│   │   │   ├── StatCard.jsx          # KPI card with visual accents and delta metrics
│   │   │   ├── GrowthChart.jsx       # Custom responsive SVG area chart
│   │   │   ├── DistributionChart.jsx # Category breakdown visualization
│   │   │   └── RecentRecords.jsx     # Top catalogued artists & recent playlists
│   │   ├── data/
│   │   │   ├── DataTable.jsx         # Sortable, column-aware relational table
│   │   │   ├── SearchBar.jsx         # Debounced attribute search input
│   │   │   ├── FilterBar.jsx         # Dynamic select filters per schema
│   │   │   ├── RecordDrawer.jsx      # Slide-out right panel for Add/Edit
│   │   │   ├── DeleteDialog.jsx      # Confirmation modal with record identifier
│   │   │   ├── ForeignKeySelect.jsx  # Searchable foreign key dropdown
│   │   │   └── Pagination.jsx        # Row limits and page navigation
│   │   └── ui/
│   │       ├── Button.jsx            # Standardized primary, ghost, danger buttons
│   │       ├── Badge.jsx             # Key badges (🔑 PK, 🔗 FK, status pills)
│   │       ├── Modal.jsx             # Accessible backdrop dialog
│   │       ├── Toast.jsx             # Non-intrusive action notification toast
│   │       ├── EmptyState.jsx        # Clean empty-table illustration card
│   │       └── LoadingSkeleton.jsx   # Animated placeholder loaders
│   ├── pages/
│   │   ├── Dashboard.jsx             # Command center with KPIs & analytics
│   │   ├── EntityPage.jsx            # Reusable engine driving all 11 CRUD views
│   │   ├── SQLStudio.jsx             # Database IDE with query editor & results
│   │   ├── ERDiagram.jsx             # Interactive relational schema graph
│   │   ├── Integration.jsx           # API documentation & live cURL tester
│   │   └── [Entity].jsx              # Thin entity wrappers (Songs, Users, etc.)
│   ├── services/
│   │   └── api.js                    # Unified service layer (Live fetch vs Demo DB)
│   ├── data/
│   │   ├── schema.js                 # Central schema definition (Single Source of Truth)
│   │   └── mockData.js               # Initial factory seed dataset
│   ├── utils/
│   │   ├── formatters.js             # Currency, duration, date, and text formatters
│   │   └── sqlEngine.js              # In-browser client SQL engine for demo mode
│   ├── App.jsx                       # Main application shell & state orchestration
│   ├── main.jsx                      # Vite entry point
│   └── index.css                     # Tailwind design tokens & dark theme styling
├── README.md                         # This file
├── API.md                            # Complete backend integration guide
└── package.json
```

---

## Installation & Running

### Prerequisites
* **Node.js**: v18.0 or higher
* **npm**: v9.0 or higher

### Development Server
```bash
# 1. Clone repository or navigate to directory
cd wavelength

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## Connecting Your Backend (For Teammates)

When the backend team has endpoints ready (e.g. built in Python Flask/FastAPI, Node.js Express, or Go):

1. Start your backend server (e.g. on `http://localhost:5000`).
2. In the Wavelength UI, click the status indicator in the top right (`● DEMO MODE`).
3. Enter your backend URL: `http://localhost:5000/api`.
4. Click **Test & Connect**.
5. The UI will ping `GET /users` on your backend. Upon a 200 response, it transitions to `● LIVE DATABASE`.

See [`API.md`](./API.md) for full HTTP request/response specifications and SQL contracts.
