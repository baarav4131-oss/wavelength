const express = require("express");
const { getConnection } = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(`
      SELECT
        episode_id,
        podcast_id,
        episode_no,
        title,
        duration,
        DBMS_LOB.SUBSTR(description, 4000, 1) AS description,
        release_date,
        audio_url
      FROM episode
      ORDER BY episode_id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch episodes" });
  } finally {
    if (connection) await connection.close();
  }
});

router.get("/podcast/:podcastId", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT
        episode_id,
        podcast_id,
        episode_no,
        title,
        duration,
        DBMS_LOB.SUBSTR(description, 4000, 1) AS description,
        release_date,
        audio_url
      FROM episode
      WHERE podcast_id = :podcast_id
      ORDER BY episode_no
      `,
      { podcast_id: req.params.podcastId }
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch podcast episodes" });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;