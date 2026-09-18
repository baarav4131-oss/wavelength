const express = require("express");
const { getConnection } = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.post("/:id/follow", authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `BEGIN follow_artist(:p_user_id, :p_artist_id); END;`,
      {
        p_user_id: req.user.user_id,
        p_artist_id: req.params.id,
      },
      { autoCommit: true }
    );
    res.status(201).json({ message: "Artist followed successfully" });
  } catch (error) {
    console.error("Follow artist error:", error);
    res.status(500).json({ error: "Failed to follow artist", details: error.message });
  } finally {
    if (connection) await connection.close();
  }
});

router.delete("/:id/follow", authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `BEGIN unfollow_artist(:p_user_id, :p_artist_id); END;`,
      {
        p_user_id: req.user.user_id,
        p_artist_id: req.params.id,
      },
      { autoCommit: true }
    );
    res.json({ message: "Artist unfollowed successfully" });
  } catch (error) {
    console.error("Unfollow artist error:", error);
    res.status(500).json({ error: "Failed to unfollow artist", details: error.message });
  } finally {
    if (connection) await connection.close();
  }
});

router.get("/", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`
      SELECT artist_id, name,
             DBMS_LOB.SUBSTR(bio, 4000, 1) AS bio,
             social_media
      FROM artist
      ORDER BY artist_id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Get artists error:", error);
    res.status(500).json({ error: "Failed to fetch artists" });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
