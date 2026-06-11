import { useState } from 'react';
import { Bell, Globe, Menu, Search, Shield, X } from 'lucide-react';

export type Page = 'dashboard' | 'incidents' | 'reports' | 'analytics' | 'settings';

interface NavbarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { label: string; page: Page }[] = [
  { label: 'Dashboard', page: 'dashboard' },
  { label: 'Incidents',  page: 'incidents'  },
  { label: 'Reports',   page: 'reports'    },
  { label: 'Analytics', page: 'analytics'  },
  { label: 'Settings',  page: 'settings'   },
];

export default function Navbar({ activePage, onNavigate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNav(page: Page) {
    onNavigate(page);
    setMenuOpen(false);
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111111] border-b border-[#242424] h-[52px] flex items-center px-4 md:px-6">
        {/* Logo */}
        <button
          onClick={() => handleNav('dashboard')}
          className="flex items-center gap-2 mr-6 flex-shrink-0"
        >
          <Shield className="w-5 h-5 text-[#00e5c3]" strokeWidth={2} />
          <span className="text-white font-bold text-[17px] tracking-tight">
            Incident<span className="text-[#00e5c3]">Mind</span>
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ label, page }) => (
            <button
              key={page}
              onClick={() => handleNav(page)}
              className={`px-3 py-1.5 text-sm font-medium relative transition-colors ${
                activePage === page ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {label}
              {activePage === page && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00e5c3] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 w-44 xl:w-52">
            <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search systems..."
              className="bg-transparent text-sm text-gray-400 placeholder-gray-600 outline-none w-full"
            />
          </div>
          <button className="lg:hidden w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors">
            <Search size={17} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors relative">
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <button className="hidden sm:flex w-8 h-8 items-center justify-center text-gray-400 hover:text-gray-200 transition-colors">
            <Globe size={17} />
          </button>
          <button className="w-7 h-7 rounded-md bg-gradient-to-br from-teal-500 to-cyan-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            U
          </button>
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors ml-1"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed top-[52px] left-0 right-0 z-40 bg-[#111111] border-b border-[#242424] shadow-lg">
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 mb-2">
              <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search systems..."
                className="bg-transparent text-sm text-gray-400 placeholder-gray-600 outline-none w-full"
              />
            </div>
            {NAV_ITEMS.map(({ label, page }) => (
              <button
                key={page}
                onClick={() => handleNav(page)}
                className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activePage === page
                    ? 'text-[#00e5c3] bg-[#0d2d24]'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
