# WAVELENGTH — BACKEND INTEGRATION CONTRACT & API SPECIFICATION

> Hand this document directly to backend engineers building the REST API and SQL services.
> 
> Base URL: `http://localhost:5000/api` (Configurable via UI or `src/services/api.js`)

---

## 1. General API Principles

1. **Format**: All request bodies and response payloads must use `Content-Type: application/json`.
2. **CORS**: The backend server must permit Cross-Origin Resource Sharing (CORS) headers for `http://localhost:5173` (Vite dev server) and any local testing ports:
   ```http
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization
   ```
3. **Database Constraints**: The backend and SQL database engine are the **ultimate source of truth** for constraint enforcement:
   * `PRIMARY KEY` uniqueness
   * `FOREIGN KEY` referential integrity
   * `NOT NULL` and `CHECK` rules
4. **Primary Key Identifiers**:
   * The frontend can handle both custom formatted alphanumeric strings (e.g. `SG001`, `U001`) or numeric auto-increments. Return whatever ID your database generates in the response object.

---

## 2. The SQL Studio Endpoint: `POST /query`

The **SQL Studio** component sends raw SQL strings directly to this endpoint.

### Request Specification
* **Method**: `POST`
* **Path**: `/query` (or `/api/query`)
* **Headers**: `Content-Type: application/json`
* **Body**:
  ```json
  {
    "sql": "SELECT s.Title, al.Title AS Album, a.Name AS Artist FROM Song s JOIN Album al ON s.Album_ID = al.Album_ID JOIN Artist a ON al.Artist_ID = a.Artist_ID WHERE s.Duration > 200;"
  }
  ```

### Expected Response
Return a 200 OK with columns and tabular row arrays:
```json
{
  "columns": ["Title", "Album", "Artist"],
  "rows": [
    ["Copper Sky", "Monsoon Circuits", "Nova Ember"],
    ["Harbour Lights", "Salt & Harbour", "The Tideline"]
  ]
}
```

### Error Response (400 or 500)
If the SQL query fails (e.g. syntax error or constraint failure), return a JSON object with error description:
```json
{
  "error": "near \"FROMM\": syntax error"
}
```

---

## 3. Relational Entity REST Endpoints

### 1. Songs (`/songs`)
* `GET /songs` → List all songs `[ { "Song_ID": "SG001", "Title": "Copper Sky", "Duration": 214, "Language": "Hindi", "Release_Date": "2023-06-14", "Album_ID": "AL001" }, ... ]`
* `POST /songs` → Create song. Body: `{ "Title": "...", "Duration": 210, "Language": "English", "Release_Date": "2024-01-01", "Album_ID": "AL001" }`. Returns created song object.
* `PUT /songs/:id` → Update song by `Song_ID`.
* `DELETE /songs/:id` → Delete song by `Song_ID`. Returns 204 No Content.

### 2. Artists (`/artists`)
* `GET /artists` → List all artists `[ { "Artist_ID": "AR001", "Name": "Nova Ember", "Country": "India", "Bio": "..." }, ... ]`
* `POST /artists` → Create artist.
* `PUT /artists/:id` → Update artist by `Artist_ID`.
* `DELETE /artists/:id` → Delete artist.

### 3. Albums (`/albums`)
* `GET /albums` → List all albums `[ { "Album_ID": "AL001", "Title": "Monsoon Circuits", "Release_Date": "2023-06-14", "Cover_Page": "https://...", "Artist_ID": "AR001" }, ... ]`
* `POST /albums` → Create album with foreign key `Artist_ID`.
* `PUT /albums/:id` → Update album.
* `DELETE /albums/:id` → Delete album.

### 4. Playlists (`/playlists`)
* `GET /playlists` → List all playlists `[ { "Playlist_ID": "PL001", "Playlist_Name": "Late Night Drive", "Created_Date": "2024-02-01", "Visibility": "Public", "User_ID": "U001" }, ... ]`
* `POST /playlists` → Create playlist with owner `User_ID`.
* `PUT /playlists/:id` → Update playlist.
* `DELETE /playlists/:id` → Delete playlist.

### 5. Podcasts (`/podcasts`)
* `GET /podcasts` → List all podcasts `[ { "Podcast_ID": "PD001", "Podcast_Title": "Signal & Noise", "Description": "...", "Language": "English", "Release_Date": "2022-08-01", "Creator_ID": "PC001" }, ... ]`
* `POST /podcasts` → Create podcast with creator FK `Creator_ID`.
* `PUT /podcasts/:id` → Update podcast.
* `DELETE /podcasts/:id` → Delete podcast.

### 6. Episodes (`/episodes`)
> [!IMPORTANT]
> `Episodes` has a **Composite Primary Key**: `[Podcast_ID, Episode_No]`.
* `GET /episodes` → List all episodes `[ { "Podcast_ID": "PD001", "Episode_No": 1, "Episode_Title": "The Algorithm Problem", "Duration": 1820, "Description": "...", "Release_Date": "2022-08-01" }, ... ]`
* `POST /episodes` → Create episode.
* `PUT /episodes/:podcast_id/:episode_no` → Update specific episode identified by composite keys.
* `DELETE /episodes/:podcast_id/:episode_no` → Delete specific episode.

### 7. Podcast Creators (`/podcast-creators`)
* `GET /podcast-creators` → List all creators `[ { "Creator_ID": "PC001", "Bio": "...", "Role": "Host" }, ... ]`
* `POST /podcast-creators` → Create creator.
* `PUT /podcast-creators/:id` → Update creator.
* `DELETE /podcast-creators/:id` → Delete creator.

### 8. Users (`/users`)
* `GET /users` → List all users `[ { "User_ID": "U001", "First_Name": "Aarav", "Last_Name": "Sharma", "Email": "aarav.sharma@mail.com", "Gender": "Male", "DOB": "1999-03-12", "Phone_No": "9840011122" }, ... ]`
* `POST /users` → Create user.
* `PUT /users/:id` → Update user by `User_ID`.
* `DELETE /users/:id` → Delete user.

### 9. Subscriptions (`/subscriptions`)
* `GET /subscriptions` → List subscriptions `[ { "Subscription_ID": "SUB001", "Plan_Type": "Premium", "Start_Date": "2023-01-01", "End_Date": "2024-01-01", "User_ID": "U001" }, ... ]`
* `POST /subscriptions` → Create subscription linked to `User_ID`.
* `PUT /subscriptions/:id` → Update subscription.
* `DELETE /subscriptions/:id` → Delete subscription.

### 10. Payments (`/payments`)
* `GET /payments` → List payments `[ { "Payment_ID": "PAY001", "Amount": 119.00, "Mode": "Card", "Payment_Date": "2023-01-01", "Subscription_ID": "SUB001" }, ... ]`
* `POST /payments` → Record transaction linked to `Subscription_ID`.
* `PUT /payments/:id` → Update payment.
* `DELETE /payments/:id` → Delete payment.

### 11. Devices (`/devices`)
* `GET /devices` → List devices `[ { "Device_ID": "DEV001", "OS": "iOS", "Type": "Mobile", "User_ID": "U001" }, ... ]`
* `POST /devices` → Register device endpoint linked to `User_ID`.
* `PUT /devices/:id` → Update device.
* `DELETE /devices/:id` → Delete device.

---

## 4. Example Backend Implementation (Python Flask)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

DB_FILE = "wavelength.db"

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/api/query", methods=["POST"])
def execute_sql():
    data = request.get_json()
    sql = data.get("sql", "")
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(sql)
        if sql.strip().upper().startswith("SELECT"):
            columns = [desc[0] for desc in cur.description] if cur.description else []
            rows = [list(r) for r in cur.fetchall()]
            return jsonify({"columns": columns, "rows": rows})
        else:
            conn.commit()
            return jsonify({"affected": cur.rowcount})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/users", methods=["GET", "POST"])
def handle_users():
    conn = get_db()
    if request.method == "GET":
        users = [dict(row) for row in conn.execute("SELECT * FROM Users").fetchall()]
        return jsonify(users)
    elif request.method == "POST":
        data = request.get_json()
        conn.execute(
            "INSERT INTO Users (User_ID, First_Name, Last_Name, Email, Gender, DOB, Phone_No) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (data.get("User_ID"), data.get("First_Name"), data.get("Last_Name"), data.get("Email"), data.get("Gender"), data.get("DOB"), data.get("Phone_No"))
        )
        conn.commit()
        return jsonify(data), 201

if __name__ == "__main__":
    app.run(port=5000, debug=True)
```
