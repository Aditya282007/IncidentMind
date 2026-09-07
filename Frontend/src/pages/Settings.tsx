export default function Settings() {
  return (
    <div className="p-6 bg-[#05081a] min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Manage your IncidentMind configuration</p>
      </header>
      
      <div className="space-y-8">
        {/* Profile Section */}
        <section className="bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Profile</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                AD
              </div>
              <div>
                <h3 className="text-white font-medium">Aditya</h3>
                <p className="text-gray-400 text-sm">aditya@example.com</p>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Email alerts</span>
              <Toggle checked={true} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">In-app notifications</span>
              <Toggle checked={false} onChange={() => {}} />
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Integrations</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Slack</span>
              <Toggle checked={true} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Microsoft Teams</span>
              <Toggle checked={false} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Webhook</span>
              <Toggle checked={false} onChange={() => {}} />
            </div>
          </div>
        </section>

        {/* AI Agents Section */}
        <section className="bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">AI Agents</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Incident summarizer</span>
              <Toggle checked={true} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Root cause analyst</span>
              <Toggle checked={false} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Remediation advisor</span>
              <Toggle checked={false} onChange={() => {}} />
            </div>
          </div>
        </section>

        {/* API Keys Section */}
        <section className="bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">API Keys</h2>
          <p className="text-gray-400 mb-4">Manage your API keys for external integrations</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">OpenAI API Key</span>
              <button className="text-cyan-400 hover:text-cyan-300">Manage</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Slack Webhook</span>
              <button className="text-cyan-400 hover:text-cyan-300">Manage</button>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Security</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Two-factor authentication</span>
              <Toggle checked={false} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Session timeout</span>
              <Toggle checked={true} onChange={() => {}} />
            </div>
          </div>
        </section>

        {/* Theme Section */}
        <section className="bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Theme</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input type="radio" id="theme-light" name="theme" className="h-4 w-4 text-cyan-500" defaultChecked />
              <label htmlFor="theme-light" className="text-gray-300">Light</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="radio" id="theme-dark" name="theme" className="h-4 w-4 text-cyan-500" />
              <label htmlFor="theme-dark" className="text-gray-300">Dark</label>
            </div>
          </div>
        </section>

        {/* Attention Policy Section */}
        <section className="bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Attention Policy</h2>
          <p className="text-gray-400 mb-4">Configure how the system prioritizes incidents</p>
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-gray-300">
              <input type="checkbox" className="h-4 w-4 text-cyan-500" defaultChecked />
              <span>Escalate unattended incidents after 15 minutes</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-300">
              <input type="checkbox" className="h-4 w-4 text-cyan-500" />
              <span>Notify supervisor on high-severity incidents</span>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 hover-lift ${checked ? 'bg-cyan-500' : 'bg-gray-600/50'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}