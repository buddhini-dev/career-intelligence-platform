const express = require("express");
const router = express.Router();
const pool = require("../db");

// POST /api/users — create or fetch user (called after Clerk login)
router.post("/", async (req, res) => {
    try {
        const { name, email, role = "student" } = req.body;
        if (!name || !email)
            return res.status(400).json({ success: false, error: "name and email required" });

        const existing = await pool.query(
            "SELECT * FROM users WHERE email = $1", [email]
        );
        if (existing.rows.length > 0)
            return res.json({ success: true, data: existing.rows[0] });

        const { rows } = await pool.query(
            "INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *",
            [name, email, role]
        );
        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/users/:email/saved-jobs
router.get("/:email/saved-jobs", async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT j.job_id, j.title, j.location, c.company_name, sj.saved_at
      FROM saved_jobs sj
      JOIN jobs j      ON sj.job_id = j.job_id
      JOIN users u     ON sj.user_id = u.user_id
      JOIN companies c ON j.company_id = c.company_id
      WHERE u.email = $1
      ORDER BY sj.saved_at DESC
    `, [req.params.email]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/users/save-job
router.post("/save-job", async (req, res) => {
    try {
        const { email, job_id } = req.body;
        const user = await pool.query("SELECT user_id FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0)
            return res.status(404).json({ success: false, error: "User not found" });

        const user_id = user.rows[0].user_id;
        await pool.query(
            "INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [user_id, job_id]
        );
        res.json({ success: true, message: "Job saved" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;