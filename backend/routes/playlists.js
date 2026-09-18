const express = require("express");
const { getConnection } = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ==================================================
// GET MY PLAYLISTS
// ==================================================

router.get("/", authenticateToken, async (req, res) => {
  let connection;

  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({
        error: "User authentication required",
      });
    }

    const userId = req.user.user_id;

    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT
        playlist_id,
        user_id,
        playlist_name,
        created_date,
        visibility
      FROM playlist
      WHERE user_id = :user_id
      ORDER BY playlist_id DESC
      `,
      {
        user_id: userId,
      }
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error(
      "Get playlists error:",
      error
    );

    return res.status(500).json({
      error: "Failed to fetch playlists",
      details: error.message,
      oracleCode: error.errorNum || null,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// ==================================================
// CREATE PLAYLIST
// ==================================================

router.post("/", authenticateToken, async (req, res) => {
  let connection;

  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({
        error: "User authentication required",
      });
    }

    const userId = req.user.user_id;

    const {
      playlist_name,
      visibility,
    } = req.body;

    if (!playlist_name || !playlist_name.trim()) {
      return res.status(400).json({
        error: "Playlist name is required",
      });
    }

    connection = await getConnection();

    await connection.execute(
      `
      BEGIN
        create_playlist(
          :p_user_id,
          :p_playlist_name,
          :p_visibility
        );
      END;
      `,
      {
        p_user_id: userId,
        p_playlist_name:
          playlist_name.trim(),
        p_visibility:
          visibility || "PUBLIC",
      },
      {
        autoCommit: true,
      }
    );

    return res.status(201).json({
      message: "Playlist created successfully",
    });
  } catch (error) {
    console.error(
      "Create playlist error:",
      error
    );

    return res.status(500).json({
      error: "Failed to create playlist",
      details: error.message,
      oracleCode: error.errorNum || null,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// ==================================================
// ADD SONG TO PLAYLIST
// ==================================================

router.post(
  "/:id/songs",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      if (!req.user || !req.user.user_id) {
        return res.status(401).json({
          error: "User authentication required",
        });
      }

      const userId = req.user.user_id;
      const playlistId = Number(req.params.id);
      const { song_id } = req.body;

      if (!playlistId || !song_id) {
        return res.status(400).json({
          error:
            "Playlist ID and song ID are required",
        });
      }

      connection = await getConnection();

      // Make sure playlist belongs to logged-in user
      const ownership = await connection.execute(
        `
        SELECT playlist_id
        FROM playlist
        WHERE playlist_id = :playlist_id
          AND user_id = :user_id
        `,
        {
          playlist_id: playlistId,
          user_id: userId,
        }
      );

      if (ownership.rows.length === 0) {
        return res.status(403).json({
          error:
            "You do not have permission to modify this playlist",
        });
      }

      await connection.execute(
        `
        BEGIN
          add_song_to_playlist(
            :p_playlist_id,
            :p_song_id
          );
        END;
        `,
        {
          p_playlist_id: playlistId,
          p_song_id: Number(song_id),
        },
        {
          autoCommit: true,
        }
      );

      return res.status(201).json({
        message: "Song added to playlist successfully",
      });
    } catch (error) {
      console.error(
        "Add song to playlist error:",
        error
      );

      return res.status(500).json({
        error: "Failed to add song to playlist",
        details: error.message,
        oracleCode: error.errorNum || null,
      });
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
);

// ==================================================
// GET PLAYLIST SONGS
// ==================================================

router.get(
  "/:id/songs",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      if (!req.user || !req.user.user_id) {
        return res.status(401).json({
          error: "User authentication required",
        });
      }

      const userId = req.user.user_id;
      const playlistId = Number(req.params.id);

      if (!playlistId) {
        return res.status(400).json({
          error: "Invalid playlist ID",
        });
      }

      connection = await getConnection();

      const result = await connection.execute(
        `
        SELECT
          s.song_id,
          s.name,
          s.duration,
          s.audio_url,
          s.artist_id,
          s.album_id,
          a.name AS artist_name,
          al.album_title
        FROM playlist_song ps
        JOIN playlist p
          ON p.playlist_id = ps.playlist_id
        JOIN song s
          ON s.song_id = ps.song_id
        LEFT JOIN artist a
          ON a.artist_id = s.artist_id
        LEFT JOIN album al
          ON al.album_id = s.album_id
        WHERE ps.playlist_id = :playlist_id
          AND p.user_id = :user_id
        ORDER BY ps.playlist_id, s.song_id
        `,
        {
          playlist_id: playlistId,
          user_id: userId,
        }
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.error(
        "Get playlist songs error:",
        error
      );

      return res.status(500).json({
        error:
          "Failed to fetch playlist songs",
        details: error.message,
        oracleCode: error.errorNum || null,
      });
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
);

module.exports = router;