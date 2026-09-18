const express = require("express");
const { getConnection } = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ==================================================
// GET CURRENT USER SUBSCRIPTION
// ==================================================

router.get("/my", authenticateToken, async (req, res) => {
  let connection;

  try {
    // Make absolutely sure authentication exists
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({
        error: "User authentication required",
      });
    }

    const userId = req.user.user_id;

    console.log(
      "GET SUBSCRIPTION FOR USER:",
      userId
    );

    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT
        subscription_id,
        user_id,
        plan_type,
        start_date,
        end_date
      FROM subscription
      WHERE user_id = :user_id
        AND start_date <= SYSDATE
        AND (
          end_date IS NULL
          OR end_date >= SYSDATE
        )
      ORDER BY
        CASE
          WHEN UPPER(plan_type) = 'PREMIUM'
          THEN 1
          ELSE 2
        END,
        subscription_id DESC
      FETCH FIRST 1 ROW ONLY
      `,
      {
        user_id: userId,
      }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "No active subscription found",
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(
      "GET SUBSCRIPTION ERROR:",
      error
    );

    return res.status(500).json({
      error: "Failed to fetch subscription",
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
// CREATE SUBSCRIPTION
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
    const { plan_type } = req.body;

    if (!plan_type) {
      return res.status(400).json({
        error: "Plan type is required",
      });
    }

    const plan = String(plan_type)
      .trim()
      .toUpperCase();

    if (!["FREE", "PREMIUM"].includes(plan)) {
      return res.status(400).json({
        error: "Invalid plan type",
      });
    }

    connection = await getConnection();

    console.log(
      "CREATE SUBSCRIPTION:",
      userId,
      plan
    );

    // ----------------------------------------------
    // CHECK ACTIVE PREMIUM
    // ----------------------------------------------

    if (plan === "PREMIUM") {
      const existing = await connection.execute(
        `
        SELECT
          subscription_id,
          plan_type,
          start_date,
          end_date
        FROM subscription
        WHERE user_id = :user_id
          AND UPPER(plan_type) = 'PREMIUM'
          AND start_date <= SYSDATE
          AND (
            end_date IS NULL
            OR end_date >= SYSDATE
          )
        `,
        {
          user_id: userId,
        }
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({
          error:
            "You already have an active Premium subscription",
        });
      }
    }

    // ----------------------------------------------
    // DATES
    // ----------------------------------------------

    const startDate = new Date();

    let endDate = null;

    if (plan === "PREMIUM") {
      endDate = new Date(startDate);

      endDate.setFullYear(
        endDate.getFullYear() + 1
      );
    }

    // ----------------------------------------------
    // PL/SQL PROCEDURE
    // ----------------------------------------------

    await connection.execute(
      `
      BEGIN
        subscribe_user(
          :p_user_id,
          :p_plan_type,
          :p_start_date,
          :p_end_date
        );
      END;
      `,
      {
        p_user_id: userId,
        p_plan_type: plan,
        p_start_date: startDate,
        p_end_date: endDate,
      },
      {
        autoCommit: true,
      }
    );

    // ----------------------------------------------
    // GET NEW SUBSCRIPTION
    // ----------------------------------------------

    const result = await connection.execute(
      `
      SELECT
        subscription_id,
        user_id,
        plan_type,
        start_date,
        end_date
      FROM subscription
      WHERE user_id = :user_id
      ORDER BY subscription_id DESC
      FETCH FIRST 1 ROW ONLY
      `,
      {
        user_id: userId,
      }
    );

    if (result.rows.length === 0) {
      return res.status(500).json({
        error:
          "Subscription was created but could not be retrieved",
      });
    }

    return res.status(201).json({
      message:
        "Premium subscription activated successfully",
      subscription: result.rows[0],
    });
  } catch (error) {
    console.error(
      "CREATE SUBSCRIPTION ERROR:",
      error
    );

    return res.status(500).json({
      error: "Failed to create subscription",
      details: error.message,
      oracleCode: error.errorNum || null,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

module.exports = router;