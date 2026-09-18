const express = require("express");
const { getConnection } = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(`
      SELECT
        album_id,
        artist_id,
        album_title,
        release_date,
        cover_page
      FROM album
      ORDER BY album_id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch albums" });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;