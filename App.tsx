import React, { useState } from 'react';
import { ImporterForm } from './components/ImporterForm';
import { NewsScanner } from './components/NewsScanner';
import { SpinRoom } from './components/SpinRoom';
import { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
    )},
    { name: 'Link Importer', id: 'importer', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
    )},
    { name: 'News Scanner', id: 'scanner', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
    )},
    { name: 'Spin Room', id: 'spin-room', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
    )},
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Importer Card */}
            <div 
                onClick={() => setActiveTab('importer')}
                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden cursor-pointer"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg className="w-32 h-32 text-blue-600 transform rotate-12 translate-x-8 -translate-y-8" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                </div>
                <div className="p-8 h-full flex flex-col">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Link Importer</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                        Transform external URLs into GoPolitical feature stories. Includes AI rewriting, auto-categorization, and WordPress syncing.
                    </p>
                    <div className="flex items-center text-blue-600 font-bold text-sm tracking-wide uppercase">
                        Start Drafting <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                </div>
            </div>

            {/* Scanner Card */}
            <div 
                onClick={() => setActiveTab('scanner')}
                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden cursor-pointer"
            >
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg className="w-32 h-32 text-teal-600 transform -rotate-12 translate-x-8 -translate-y-8" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                </div>
                <div className="p-8 h-full flex flex-col">
                    <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-sm">
                         <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">News Scanner</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                        Monitor major Nigerian outlets like Punch & Guardian. Automatically filter for political relevance and detect trends.
                    </p>
                    <div className="flex items-center text-teal-600 font-bold text-sm tracking-wide uppercase">
                        Scan Sources <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                </div>
            </div>

            {/* Spin Room Card */}
            <div 
                onClick={() => setActiveTab('spin-room')}
                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden cursor-pointer"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg className="w-32 h-32 text-purple-600 transform rotate-12 translate-x-8 -translate-y-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </div>
                <div className="p-8 h-full flex flex-col">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
                         <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Spin Room</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                        Repurpose your drafts into viral Twitter threads, WhatsApp broadcasts, and download branded viral quote cards instantly.
                    </p>
                    <div className="flex items-center text-purple-600 font-bold text-sm tracking-wide uppercase">
                        Create Socials <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Workflow Section */}
        <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden mt-10">
            <div className="p-8 md:p-12 relative">
                 <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
                 <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-600 rounded-full opacity-20 blur-3xl"></div>
                 
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-white">Editorial Workflow</h3>
                        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">Guide</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                         {/* Connecting Line for Desktop */}
                         <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-slate-800 -z-10 transform translate-y-2"></div>

                        <div className="flex flex-col relative">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg shadow-lg border-4 border-slate-900">1</div>
                                <h4 className="ml-3 text-lg font-medium text-white">Find or Import</h4>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed pl-2">
                                Use the <strong className="text-teal-400 cursor-pointer hover:underline" onClick={() => setActiveTab('scanner')}>News Scanner</strong> to discover stories or paste a URL directly into the <strong className="text-blue-400 cursor-pointer hover:underline" onClick={() => setActiveTab('importer')}>Link Importer</strong>.
                            </p>
                        </div>
                        <div className="flex flex-col relative">
                             <div className="flex items-center mb-4">
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg shadow-lg border-4 border-slate-900">2</div>
                                <h4 className="ml-3 text-lg font-medium text-white">Draft & Refine</h4>
                            </div>
                             <p className="text-slate-400 text-sm leading-relaxed pl-2">
                                AI automatically drafts a 700+ word feature. Review the headline, refine the categories, and publish to WordPress.
                            </p>
                        </div>
                        <div className="flex flex-col relative">
                             <div className="flex items-center mb-4">
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg shadow-lg border-4 border-slate-900">3</div>
                                <h4 className="ml-3 text-lg font-medium text-white">Spin & Distribute</h4>
                            </div>
                             <p className="text-slate-400 text-sm leading-relaxed pl-2">
                                Send the content to the <strong className="text-purple-400 cursor-pointer hover:underline" onClick={() => setActiveTab('spin-room')}>Spin Room</strong> to generate threads, broadcasts, and viral quote cards.
                            </p>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
            <div className="animate-fade-in-up pb-12">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}, Editor.
                        </h2>
                        <p className="text-slate-500 mt-2 text-lg">
                            Ready to break the next big story?
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium border border-emerald-100">
                         <span className="relative flex h-2.5 w-2.5 mr-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        System Online
                    </div>
                </div>
                {renderDashboard()}
            </div>
        );
      case 'importer':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 animate-fade-in-up">
             <div className="mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">Link Importer</h2>
                <p className="text-gray-500 text-sm">Fetch, summarize, and draft articles from external URLs.</p>
             </div>
             <ImporterForm setActiveTab={setActiveTab} />
          </div>
        );
      case 'scanner':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 animate-fade-in-up">
             <div className="mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">News Scanner</h2>
                <p className="text-gray-500 text-sm">Monitor trusted sources for breaking political news.</p>
             </div>
             <NewsScanner setActiveTab={setActiveTab} />
          </div>
        );
      case 'spin-room':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 animate-fade-in-up">
             <SpinRoom />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" 
            onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-20 border-b border-slate-800 bg-slate-950">
           <div className="text-center">
             <h1 className="text-xl font-bold tracking-wider text-white">GoPolitical</h1>
             <span className="text-xs text-slate-400 uppercase tracking-widest">Content Suite</span>
           </div>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'} mr-3`}>
                {item.icon}
              </span>
              {item.name}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-950">
            <p className="text-xs text-center text-slate-500">&copy; {new Date().getFullYear()} GoPolitical</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm z-10 h-16 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center">
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                    <span className="sr-only">Open sidebar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h2 className="ml-2 md:ml-0 text-lg font-semibold text-gray-800 truncate">
                    {navigation.find(n => n.id === activeTab)?.name || 'Dashboard'}
                </h2>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        System Online
                    </span>
                </div>
            </div>
        </header>

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderContent()}
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;