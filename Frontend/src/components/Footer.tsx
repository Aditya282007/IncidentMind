import { BarChart2, MessageSquare, Settings, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f0f0f] border-t border-[#1e1e1e] px-4 sm:px-6 md:px-8 py-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Shield className="w-5 h-5 text-[#00e5c3]" />
          <div>
            <div className="text-white font-bold text-sm">
              Incident<span className="text-[#00e5c3]">Mind</span>
            </div>
            <div className="text-gray-500 text-xs mt-0.5">Autonomous Cloud SRE Systems</div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-start md:justify-center">
          {['Documentation', 'API Status', 'Security Compliance', 'Terms of Service'].map((link) => (
            <a
              key={link}
              href="#"
              className="text-gray-400 text-sm hover:text-gray-200 transition-colors"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Icons + copyright */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
              <MessageSquare size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
              <BarChart2 size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
              <Settings size={16} />
            </button>
          </div>
          <span className="text-gray-600 text-xs">© 2024 INCIDENTMIND SRE SYSTEMS</span>
        </div>
      </div>
    </footer>
  );
}
