const express = require("express");
const { getConnection } = require("../db");

const router = express.Router();

router.post("/register", async (req, res) => {
  let connection;

  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      phone_no,
      gender,
      dob
    } = req.body;

    if (!first_name || !email) {
      return res.status(400).json({
        error: "First name and email are required"
      });
    }

    connection = await getConnection();

    await connection.execute(
      `
      BEGIN
        register_user(
          :p_first_name,
          :p_middle_name,
          :p_last_name,
          :p_email,
          :p_phone_no,
          :p_gender,
          :p_dob
        );
      END;
      `,
      {
        p_first_name: first_name,
        p_middle_name: middle_name || null,
        p_last_name: last_name || null,
        p_email: email,
        p_phone_no: phone_no || null,
        p_gender: gender || null,
        p_dob: dob ? new Date(dob) : null
      }
    );

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to register user",
      details: error.message
    });

  } finally {
    if (connection) {
      await connection.close();
    }
  }
});


router.get("/", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(`
      SELECT
        user_id,
        first_name,
        middle_name,
        last_name,
        email,
        phone_no,
        gender,
        dob
      FROM app_user
      ORDER BY user_id
    `);

    res.json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch users"
    });

  } finally {
    if (connection) {
      await connection.close();
    }
  }
});


router.get("/:id", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT
        user_id,
        first_name,
        middle_name,
        last_name,
        email,
        phone_no,
        gender,
        dob
      FROM app_user
      WHERE user_id = :user_id
      `,
      {
        user_id: req.params.id
      }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch user"
    });

  } finally {
    if (connection) {
      await connection.close();
    }
  }
});


module.exports = router;