# Music & Podcast Streaming Platform

A music and podcast streaming platform built with Next.js, Node.js, Express.js, Oracle Database, and PL/SQL.

The project combines a modern web frontend with a REST-based backend and an Oracle database. It supports music playback, playlists, artist follows, podcasts, authentication, premium subscriptions, and payment history.

## Features

### User & Authentication

- User registration and login
- JWT authentication
- Password hashing using bcryptjs
- Protected API requests
- User information management

### Music

- Music browsing and playback
- Artist browsing
- Album browsing
- Search
- Song information and management

### Playlists

- Playlist creation
- Add songs to playlists
- Song management inside playlists
- Playlist visibility management

### Artists

- Browse artists
- Follow artists
- Unfollow artists
- Artist follower information

### Podcasts

- Podcast browsing
- Podcast creator browsing
- Episode browsing
- Podcast and episode information

### Premium

- Premium subscription
- Subscription management
- Payment recording
- Payment history
- User plan information

### Devices

- User device management
- Device information associated with users

## Tech Stack

- Frontend: Next.js, React, TypeScript
- Backend: Node.js, Express.js
- Database: Oracle Database Free 23.x
- Database Programming: SQL and PL/SQL
- Authentication: JWT + bcryptjs
- Package Manager: npm
- Version Control: Git and GitHub

## Project Structure

```text
music-streaming/
├── frontend/
├── backend/
└── database/
    ├── 01_tables.sql
    ├── 02_constraints.sql
    ├── 02_procedures.sql
    ├── 03_functions.sql
    ├── 04_triggers.sql
    └── 05_seed.sql
