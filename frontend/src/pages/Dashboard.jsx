import { useEffect, useState } from "react";
import { fetchAnalytics } from "../api";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    PieChart, Pie, Cell, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics()
            .then(res => setData(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="p-6 text-gray-400">Loading analytics...</p>;
    if (!data) return <p className="p-6 text-red-400">Failed to load analytics.</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics Dashboard</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Jobs", value: data.total_jobs },
                    { label: "Companies", value: data.total_companies },
                    { label: "Top Skill", value: data.top_skills[0]?.skill_name },
                    { label: "Top Location", value: data.location_stats[0]?.location },
                ].map(card => (
                    <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">{card.label}</p>
                        <p className="text-2xl font-semibold text-gray-800 mt-1">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h2 className="text-lg font-semibold mb-4">Top Skills in Demand</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={data.top_skills}>
                            <XAxis dataKey="skill_name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="demand" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h2 className="text-lg font-semibold mb-4">Jobs by Location</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={data.location_stats} dataKey="count" nameKey="location" cx="50%" cy="50%" outerRadius={100} label>
                                {data.location_stats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 md:col-span-2">
                    <h2 className="text-lg font-semibold mb-4">Top Hiring Companies</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={data.top_companies} layout="vertical">
                            <XAxis type="number" />
                            <YAxis dataKey="company_name" type="category" width={150} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="job_count" fill="#10B981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}