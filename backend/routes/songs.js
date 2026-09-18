const express = require("express");
const { getConnection } = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(`
      SELECT
        s.song_id,
        s.name,
        s.duration,
        s.audio_url,
        s.artist_id,
        s.album_id,
        a.name AS artist_name,
        al.album_title
      FROM song s
      LEFT JOIN artist a
        ON a.artist_id = s.artist_id
      LEFT JOIN album al
        ON al.album_id = s.album_id
      ORDER BY s.song_id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get songs error:", error);

    res.status(500).json({
      error: "Failed to fetch songs",
      details: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

module.exports = router;