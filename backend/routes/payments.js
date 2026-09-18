const express = require("express");
const { getConnection } = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// GET CURRENT USER'S PAYMENT HISTORY
router.get("/my", authenticateToken, async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT
        payment_id,
        user_id,
        subscription_id,
        amount,
        payment_mode,
        payment_date
      FROM payment
      WHERE user_id = :user_id
      ORDER BY payment_date DESC, payment_id DESC
      `,
      {
        user_id: req.user.user_id,
      }
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get payments error:", error);

    res.status(500).json({
      error: "Failed to fetch payment history",
      details: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// MAKE PAYMENT
router.post("/", authenticateToken, async (req, res) => {
  let connection;

  try {
    const {
      subscription_id,
      amount,
      payment_mode,
    } = req.body;

    if (!subscription_id || amount === undefined || !payment_mode) {
      return res.status(400).json({
        error: "Subscription ID, amount and payment mode are required",
      });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({
        error: "Amount cannot be negative",
      });
    }

    connection = await getConnection();

    // Make sure subscription belongs to logged-in user
    const subscription = await connection.execute(
      `
      SELECT subscription_id, plan_type
      FROM subscription
      WHERE subscription_id = :subscription_id
        AND user_id = :user_id
      `,
      {
        subscription_id,
        user_id: req.user.user_id,
      }
    );

    if (subscription.rows.length === 0) {
      return res.status(403).json({
        error: "Subscription does not belong to this user",
      });
    }

    await connection.execute(
      `
      BEGIN
        make_payment(
          :p_user_id,
          :p_subscription_id,
          :p_amount,
          :p_payment_mode
        );
      END;
      `,
      {
        p_user_id: req.user.user_id,
        p_subscription_id: subscription_id,
        p_amount: Number(amount),
        p_payment_mode: payment_mode,
      },
      {
        autoCommit: true,
      }
    );

    res.status(201).json({
      message: "Payment recorded successfully",
    });
  } catch (error) {
    console.error("Payment error:", error);

    res.status(500).json({
      error: "Payment failed",
      details: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

module.exports = router;