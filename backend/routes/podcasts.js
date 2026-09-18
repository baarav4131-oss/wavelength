const express = require("express");
const { getConnection } = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(`
      SELECT
        podcast_id,
        creator_id,
        title,
        language,
        release_date,
        DBMS_LOB.SUBSTR(description, 4000, 1) AS description
      FROM podcast
      ORDER BY podcast_id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch podcasts" });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;