import { useEffect, useState } from "react";
import { fetchJobs } from "../api";
import JobCard from "../components/JobCard";

export default function Home() {
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs()
            .then(res => setJobs(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filtered = jobs.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        job.location?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tech Jobs</h1>
            <p className="text-gray-500 mb-6">{jobs.length} jobs found</p>

            <input
                type="text"
                placeholder="Search by title, company, or location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {loading ? (
                <p className="text-gray-400">Loading jobs...</p>
            ) : filtered.length === 0 ? (
                <p className="text-gray-400">No jobs found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(job => <JobCard key={job.job_id} job={job} />)}
                </div>
            )}
        </div>
    );
}