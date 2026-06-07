const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all jobs with company name and skills
router.get("/", async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT j.job_id, j.title, j.location, j.salary_min, j.salary_max,
             j.source_url, j.posting_date, c.company_name,
             STRING_AGG(s.skill_name, ', ') AS skills
      FROM jobs j
      LEFT JOIN companies c   ON j.company_id = c.company_id
      LEFT JOIN job_skills js ON j.job_id = js.job_id
      LEFT JOIN skills s      ON js.skill_id = s.skill_id
      GROUP BY j.job_id, c.company_name
      ORDER BY j.posting_date DESC
      LIMIT 100
    `);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET single job by ID
router.get("/:id", async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT j.*, c.company_name,
             STRING_AGG(s.skill_name, ', ') AS skills
      FROM jobs j
      LEFT JOIN companies c   ON j.company_id = c.company_id
      LEFT JOIN job_skills js ON j.job_id = js.job_id
      LEFT JOIN skills s      ON js.skill_id = s.skill_id
      WHERE j.job_id = $1
      GROUP BY j.job_id, c.company_name
    `, [req.params.id]);

        if (rows.length === 0)
            return res.status(404).json({ success: false, error: "Job not found" });

        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET analytics summary
router.get("/analytics/summary", async (req, res) => {
    try {
        const totalJobs = await pool.query("SELECT COUNT(*) FROM jobs");
        const totalCompanies = await pool.query("SELECT COUNT(*) FROM companies");

        const topSkills = await pool.query(`
      SELECT s.skill_name, COUNT(*) AS demand
      FROM job_skills js
      JOIN skills s ON js.skill_id = s.skill_id
      GROUP BY s.skill_name
      ORDER BY demand DESC
      LIMIT 10
    `);

        const topCompanies = await pool.query(`
      SELECT c.company_name, COUNT(j.job_id) AS job_count
      FROM companies c
      JOIN jobs j ON c.company_id = j.company_id
      GROUP BY c.company_name
      ORDER BY job_count DESC
      LIMIT 10
    `);

        const locationStats = await pool.query(`
      SELECT location, COUNT(*) AS count
      FROM jobs
      GROUP BY location
      ORDER BY count DESC
      LIMIT 10
    `);

        res.json({
            success: true,
            data: {
                total_jobs: parseInt(totalJobs.rows[0].count),
                total_companies: parseInt(totalCompanies.rows[0].count),
                top_skills: topSkills.rows,
                top_companies: topCompanies.rows,
                location_stats: locationStats.rows,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;