import { useState } from "react";
import { classifyJob, predictSalary, matchResume } from "../api";

export default function Predictions() {
    const [title, setTitle] = useState("");
    const [description, setDesc] = useState("");
    const [location, setLocation] = useState("");
    const [skills, setSkills] = useState("");
    const [resume, setResume] = useState("");
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState({});

    const run = async (type, fn, payload) => {
        setLoading(l => ({ ...l, [type]: true }));
        try {
            const res = await fn(payload);
            setResults(r => ({ ...r, [type]: res.data.data }));
        } catch (err) {
            setResults(r => ({ ...r, [type]: { error: err.message } }));
        } finally {
            setLoading(l => ({ ...l, [type]: false }));
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">ML Predictions</h1>

            {/* Job Classifier */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Job Category Classifier</h2>
                <input className="w-full border rounded-lg px-3 py-2 mb-3" placeholder="Job title" value={title} onChange={e => setTitle(e.target.value)} />
                <textarea className="w-full border rounded-lg px-3 py-2 mb-3 h-24" placeholder="Job description" value={description} onChange={e => setDesc(e.target.value)} />
                <button onClick={() => run("classify", classifyJob, { title, description })}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    {loading.classify ? "Classifying..." : "Classify Job"}
                </button>
                {results.classify && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-blue-800 font-medium">Category: {results.classify.category || results.classify.error}</p>
                    </div>
                )}
            </div>

            {/* Salary Predictor */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Salary Predictor</h2>
                <input className="w-full border rounded-lg px-3 py-2 mb-3" placeholder="Job title" value={title} onChange={e => setTitle(e.target.value)} />
                <input className="w-full border rounded-lg px-3 py-2 mb-3" placeholder="Location (e.g. Remote)" value={location} onChange={e => setLocation(e.target.value)} />
                <input className="w-full border rounded-lg px-3 py-2 mb-3" placeholder="Skills (e.g. python sql aws)" value={skills} onChange={e => setSkills(e.target.value)} />
                <button onClick={() => run("salary", predictSalary, { title, location, skills })}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                    {loading.salary ? "Predicting..." : "Predict Salary"}
                </button>
                {results.salary && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-green-800 font-medium">Estimated: ${results.salary.estimated_salary?.toLocaleString()}</p>
                        <p className="text-green-700 text-sm">Range: ${results.salary.range_min?.toLocaleString()} — ${results.salary.range_max?.toLocaleString()}</p>
                    </div>
                )}
            </div>

            {/* Resume Matcher */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Resume Skill Matcher</h2>
                <textarea className="w-full border rounded-lg px-3 py-2 mb-3 h-32" placeholder="Paste your resume text or list your skills here..." value={resume} onChange={e => setResume(e.target.value)} />
                <button onClick={() => run("match", matchResume, { resume_text: resume })}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                    {loading.match ? "Matching..." : "Match Resume"}
                </button>
                {results.match?.matches && (
                    <div className="mt-4 space-y-3">
                        {results.match.matches.map((m, i) => (
                            <div key={i} className="p-3 bg-purple-50 rounded-lg">
                                <p className="font-medium text-purple-800">{m.title} @ {m.company}</p>
                                <p className="text-purple-700 text-sm">Match: {m.match_score}%</p>
                                <p className="text-purple-600 text-xs">Missing: {m.missing_skills?.join(", ") || "none"}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}