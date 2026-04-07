import { useState } from 'react';
import { Toaster } from 'sonner';
import { ExploreTab } from './components/ExploreTab';
import { PostVibeTab } from './components/PostVibeTab';
import { PlacesProvider } from './context/PlacesContext';

type Tab = 'explore' | 'post';

function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('explore');

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      {/* Top Tab Bar - Minimal Style */}
      <div className="bg-white border-b border-gray-200 flex" style={{ boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)' }}>
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex-1 py-4 font-medium text-base transition-colors ${
            activeTab === 'explore'
              ? 'text-[#4A90E2] bg-blue-50'
              : 'text-gray-600 bg-white hover:bg-gray-50'
          }`}
        >
          🗺️ Explore
        </button>
        <button
          onClick={() => setActiveTab('post')}
          className={`flex-1 py-4 font-medium text-base transition-colors ${
            activeTab === 'post'
              ? 'text-[#4A90E2] bg-blue-50'
              : 'text-gray-600 bg-white hover:bg-gray-50'
          }`}
        >
          ☕ Post Vibe
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'explore' && <ExploreTab />}
        {activeTab === 'post' && <PostVibeTab />}
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <PlacesProvider>
      <AppShell />
    </PlacesProvider>
  );
}