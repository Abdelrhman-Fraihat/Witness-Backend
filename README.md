# Witness-Backend

This is the backend API for the **Witness** app (crime reporting + admin review).  
It provides endpoints for:

- Auth (signup / login)
- User crime reporting (create / read / update / delete)
- Admin moderation (approve/reject crimes, manage users)
- Image uploads (stored locally and served as static files)

---

## 🏗️ Tech Stack

- Node.js + Express (ES Modules)
- PostgreSQL (`pg`)
- `multer` for image uploads
- `dotenv`, `cors`

---

## 🚀 Getting Started

### 1) Install dependencies

```bash
npm install
```
### 2) Configure environment variables

```bash
Create a .env file (based on .env.sample):

PORT=3000
DATABASE_URL=postgresql://<Username>:<password>@localhost:<PORT>/<DatabaseName>
```
### 3) Create DB tables

```bash
Make sure PostgreSQL is running, then run:

psql -d <DatabaseName> -f schema.sql

use pgAdmin to import the database, because of the Arabic data
```

### 4) Start the server
```bash
npm start
If everything is OK, the server runs on:

http://localhost:<PORT>

Health check: GET / → "API Server is ALive"
```
```bash
🗂️ Project Structure
witness-backend/
├── middleware/
│   └── adminAuth.js          # Admin guard using x-role header
├── routes/
│   ├── authRoutes.js         # signup & login
│   ├── userRoutes.js         # user crimes endpoints + upload
│   └── adminRoutes.js        # admin review + user management
├── uploadsImages/            # uploaded images stored here
├── schema.sql                # PostgreSQL schema
├── database.js               # pg client connection
└── server.js                 # app entry point
```

```bash
🖼️ Image Uploads
Images are uploaded to the local folder:

uploadsImages/

They are served statically via:

GET /uploadsImages/<filename>

So media URLs stored in DB look like:

/uploadsImages/<filename>
```
### 📡 API Base URL

```bash
By default, routes are under:

http://localhost:<PORT>
```
### 🔐 Auth Routes

``` bash
Base URL: /api/auth

POST /api/auth/signup
Registers a new user.

Body (JSON):

{
  "firstName": "Ahmad",
  "lastName": "Ali",
  "email": "user@example.com",
  "password": "123456"
}
Response:

{
  "user": {
    "id": 1,
    "first_name": "Ahmad",
    "last_name": "Ali",
    "email": "user@example.com",
    "role": "user"
  }
}

POST /api/auth/login
Logs in a user and returns the user row.

Body (JSON):

{
  "email": "user@example.com",
  "password": "123456"
}
Response:

{
  "user": { "...user fields..." }
}
```
### 👤 User Routes

```bash
Base URL: /api/user

POST /api/user/AddCrime
Creates a new crime report and uploads up to 3 images.

Content-Type: multipart/form-data
Files field name: images (up to 3)

Form fields:

title (required)

city (required)

incident_date (required)

reporter_id (required)

short_description (optional)

description (optional)

crime_type (optional)

country (optional, default: "فلسطين")

Response:

{
  "message": "Crime created",
  "crimeId": 10
}
GET /api/user/Crimes
Returns all crimes.

Response: array of crime rows.

GET /api/user/crimes/:id
Returns a single crime with reporter info and media URLs.

Response example:

{
  "id": 10,
  "title": "Example",
  "description": "Details...",
  "crime_type": "type",
  "country": "فلسطين",
  "city": "Gaza",
  "incident_date": "2026-01-21",
  "status": "pending",
  "reporter": "First Last",
  "email": "user@example.com",
  "media": [
    "/uploadsImages/abc123",
    "/uploadsImages/def456"
  ]
}
GET /api/user/crimes/user/:userId
Returns all crimes reported by a specific user.

DELETE /api/user/deleteCrime/:id
Deletes a crime by ID.

PUT /api/user/updateCrime/:id
Updates an existing crime.

Body (JSON):

{
  "title": "Updated title",
  "short_description": "Updated short description",
  "description": "Updated description",
  "crime_type": "Updated type",
  "city": "Updated city",
  "incident_date": "2026-01-21"
}
Response:

{
  "message": "Crime updated",
  "crime": { "...updated row..." }
}
```
### 🛡️ Admin Routes
```bash
Base URL: /api/admin

All admin endpoints require this header:

x-role: admin

Example (Postman):

x-role: admin
⚠️ This is a simple role check for the project (not secure for production).

PUT /api/admin/crimes/:id/status
Approve or reject a crime.

Body (JSON):

{ "status": "approved" }
Allowed values:

approved

rejected

Response:

{
  "message": "Crime status updated",
  "crime": { "...updated row..." }
}
GET /api/admin/users
Returns a list of users:

id, first_name, last_name, email, state, role

PUT /api/admin/users/:id/state
Enable/disable a user.

Body (JSON):

{ "state": "disabled" }
Allowed values:

active

disabled

Response:

{
  "message": "User state updated",
  "user": { "...updated user..." }
}
```