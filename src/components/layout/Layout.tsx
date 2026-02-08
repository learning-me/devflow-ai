import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-background flex w-full overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 h-full overflow-auto bg-background overflow-x-hidden">
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
