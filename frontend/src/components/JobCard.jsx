export default function JobCard({ job }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800 text-lg leading-tight">{job.title}</h3>
                {job.salary_min && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                        ${(job.salary_min / 1000).toFixed(0)}k+
                    </span>
                )}
            </div>
            <p className="text-blue-600 text-sm font-medium mb-1">{job.company_name}</p>
            <p className="text-gray-500 text-sm mb-3">{job.location}</p>
            {job.skills && (
                <div className="flex flex-wrap gap-1">
                    {job.skills.split(", ").slice(0, 4).map(skill => (
                        <span key={skill} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                            {skill}
                        </span>
                    ))}
                </div>
            )}
            {job.source_url && (
                <a href={job.source_url} target="_blank" rel="noreferrer"
                    className="block mt-3 text-xs text-gray-400 hover:text-blue-500 transition-colors">
                    View job →
                </a>
            )}
        </div>
    );
}