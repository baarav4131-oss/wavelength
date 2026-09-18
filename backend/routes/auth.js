const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const oracledb = require("oracledb");
const { getConnection } = require("../db");

const router = express.Router();

/* =========================================================
   HELPER
   Handles Oracle column names regardless of case
   ========================================================= */

function getColumn(row, columnName) {
  if (!row) return undefined;

  const target = columnName.toLowerCase();

  const key = Object.keys(row).find(
    (key) => key.toLowerCase() === target
  );

  return key ? row[key] : undefined;
}


/* =========================================================
   CREATE JWT
   ========================================================= */

function createToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}


/* =========================================================
   REGISTER
   ========================================================= */

router.post("/register", async (req, res) => {
  let connection;

  try {
    const {
      first_name,
      last_name,
      email,
      password,
    } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        error:
          "First name, last name, email and password are required",
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

    /* Check existing account */

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
        error:
          "An account with this email already exists",
      });
    }

    /* Hash password */

    const hashedPassword = await bcrypt.hash(
      cleanPassword,
      10
    );

    console.log(
      "CREATING USER:",
      cleanEmail
    );

    /* Insert user */

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
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      },
      {
        autoCommit: true,
      }
    );

    const userId = result.outBinds.user_id[0];

    console.log(
      "NEW USER ID:",
      userId
    );

    /* Verify inserted user */

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

    if (verifyResult.rows.length === 0) {
      console.error(
        "USER WAS NOT FOUND AFTER INSERT:",
        userId
      );

      return res.status(500).json({
        error:
          "Account was created but could not be verified",
      });
    }

    const row = verifyResult.rows[0];

    /* Read Oracle values safely */

    const user = {
      user_id: getColumn(row, "user_id"),
      first_name: getColumn(row, "first_name"),
      last_name: getColumn(row, "last_name"),
      email: getColumn(row, "email"),
      password: getColumn(row, "password"),
    };

    console.log(
      "REGISTER VERIFICATION:",
      {
        user_id: user.user_id,
        email: user.email,
        passwordExists: !!user.password,
      }
    );

    if (!user.password) {
      console.error(
        "PASSWORD WAS NOT STORED FOR USER:",
        user.user_id
      );

      return res.status(500).json({
        error:
          "Account was created but password was not stored",
      });
    }

    const token = createToken(user);

    return res.status(201).json({
      message: "Registration successful",

      token,

      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

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


/* =========================================================
   LOGIN
   ========================================================= */

router.post("/login", async (req, res) => {
  let connection;

  try {
    const {
      email,
      password,
    } = req.body;

    console.log(
      "LOGIN REQUEST:",
      {
        email,
        passwordProvided: !!password,
      }
    );

    if (!email || !password) {
      return res.status(400).json({
        error:
          "Email and password are required",
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

    console.log(
      "ROWS FOUND:",
      result.rows.length
    );

    if (result.rows.length === 0) {
      console.log(
        "USER NOT FOUND:",
        cleanEmail
      );

      return res.status(401).json({
        error:
          "Invalid email or password",
      });
    }

    const row = result.rows[0];

    /* Read Oracle result safely */

    const user = {
      user_id: getColumn(row, "user_id"),
      first_name: getColumn(row, "first_name"),
      last_name: getColumn(row, "last_name"),
      email: getColumn(row, "email"),
      password: getColumn(row, "password"),
    };

    console.log(
      "USER FOUND:",
      user.email
    );

    console.log(
      "USER ID:",
      user.user_id
    );

    console.log(
      "PASSWORD HASH EXISTS:",
      !!user.password
    );

    if (!user.password) {
      return res.status(401).json({
        error:
          "This account does not have a password. Please register again.",
      });
    }

    /* Compare password */

    const passwordMatches =
      await bcrypt.compare(
        String(password),
        user.password
      );

    console.log(
      "PASSWORD MATCH:",
      passwordMatches
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error:
          "Invalid email or password",
      });
    }

    /* Create JWT */

    const token = createToken(user);

    console.log(
      "LOGIN SUCCESSFUL FOR USER:",
      user.user_id
    );

    return res.status(200).json({
      message: "Login successful",

      token,

      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

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