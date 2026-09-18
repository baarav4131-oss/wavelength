const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getConnection } = require("../db");

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    {
      user_id: user.USER_ID,
      email: user.EMAIL,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
  let connection;

  try {
    const {
      first_name,
      last_name,
      email,
      password,
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        error: "First name, last name, email and password are required",
      });
    }

    const cleanFirstName = String(first_name).trim();
    const cleanLastName = String(last_name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    if (cleanPassword.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    connection = await getConnection();

    // Check if email already exists
    const existing = await connection.execute(
      `
      SELECT user_id
      FROM app_user
      WHERE LOWER(TRIM(email)) = :email
      `,
      {
        email: cleanEmail,
      }
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "An account with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      cleanPassword,
      10
    );

    console.log("REGISTER EMAIL:", cleanEmail);
    console.log("PASSWORD HASH CREATED:", !!hashedPassword);

    // Insert user AND password
    const result = await connection.execute(
      `
      INSERT INTO app_user (
        first_name,
        last_name,
        email,
        password
      )
      VALUES (
        :first_name,
        :last_name,
        :email,
        :password
      )
      RETURNING user_id INTO :user_id
      `,
      {
        first_name: cleanFirstName,
        last_name: cleanLastName,
        email: cleanEmail,
        password: hashedPassword,
        user_id: {
          dir: require("oracledb").BIND_OUT,
          type: require("oracledb").NUMBER,
        },
      },
      {
        autoCommit: true,
      }
    );

    const userId = result.outBinds.user_id[0];

    // Verify that password was actually saved
    const verifyResult = await connection.execute(
      `
      SELECT
        user_id,
        first_name,
        last_name,
        email,
        password
      FROM app_user
      WHERE user_id = :user_id
      `,
      {
        user_id: userId,
      }
    );

    if (
      verifyResult.rows.length === 0 ||
      !verifyResult.rows[0].PASSWORD
    ) {
      console.error(
        "PASSWORD WAS NOT STORED FOR USER:",
        userId
      );

      return res.status(500).json({
        error: "Account was created but password was not stored",
      });
    }

    const user = verifyResult.rows[0];

    const token = createToken(user);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        user_id: user.USER_ID,
        first_name: user.FIRST_NAME,
        last_name: user.LAST_NAME,
        email: user.EMAIL,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      error: "Registration failed",
      details: error.message,
      oracleCode: error.errorNum || null,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});


/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  let connection;

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT
        user_id,
        first_name,
        last_name,
        email,
        password
      FROM app_user
      WHERE LOWER(TRIM(email)) = :email
      `,
      {
        email: cleanEmail,
      }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    console.log("LOGIN USER:", user.USER_ID);
    console.log(
      "PASSWORD EXISTS:",
      !!user.PASSWORD
    );

    if (!user.PASSWORD) {
      return res.status(401).json({
        error:
          "This account does not have a password. Please register again.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      String(password),
      user.PASSWORD
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        user_id: user.USER_ID,
        first_name: user.FIRST_NAME,
        last_name: user.LAST_NAME,
        email: user.EMAIL,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      error: "Login failed",
      details: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});


module.exports = router;