const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");

function runPythonModel(scriptName, inputData) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, "../../ml", scriptName);
        const process = spawn("python", [scriptPath, JSON.stringify(inputData)]);

        let output = "";
        let error = "";

        process.stdout.on("data", data => output += data.toString());
        process.stderr.on("data", data => error += data.toString());

        process.on("close", code => {
            if (code !== 0) return reject(new Error(error));
            try {
                resolve(JSON.parse(output));
            } catch {
                resolve({ result: output.trim() });
            }
        });
    });
}

// POST /api/predictions/classify
router.post("/classify", async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description)
            return res.status(400).json({ success: false, error: "title and description required" });

        const result = await runPythonModel("predict_classify.py", { title, description });
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/predictions/salary
router.post("/salary", async (req, res) => {
    try {
        const { title, location, skills } = req.body;
        if (!title)
            return res.status(400).json({ success: false, error: "title required" });

        const result = await runPythonModel("predict_salary.py", { title, location, skills });
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/predictions/match
router.post("/match", async (req, res) => {
    try {
        const { resume_text } = req.body;
        if (!resume_text)
            return res.status(400).json({ success: false, error: "resume_text required" });

        const result = await runPythonModel("predict_match.py", { resume_text });
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;