import { Link, useLocation } from "react-router-dom";

const links = [
    { to: "/", label: "Jobs" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/predictions", label: "Predict" },
    { to: "/assistant", label: "Assistant" },
];

export default function Navbar() {
    const { pathname } = useLocation();
    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <span className="text-xl font-bold text-blue-600">CareerIQ</span>
            <div className="flex gap-6">
                {links.map(link => (
                    <Link key={link.to} to={link.to}
                        className={`text-sm font-medium transition-colors ${pathname === link.to ? "text-blue-600" : "text-gray-500 hover:text-gray-800"
                            }`}>
                        {link.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}