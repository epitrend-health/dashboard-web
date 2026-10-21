/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { OverviewPage } from './features/overview/OverviewPage';
import { DiseaseTrendsPage } from './features/disease-trends/DiseaseTrendsPage';
import { ForecastExplorerPage } from './features/forecast-explorer/ForecastExplorerPage';
import { SupplyDemandPage } from './features/supply-demand/SupplyDemandPage';
import { ModelPerformancePage } from './features/model-performance/ModelPerformancePage';
import { DataManagementPage } from './features/data-management/DataManagementPage';
import { ImportHistoryPage } from './features/import-history/ImportHistoryPage';
import { CsvImportWizard } from './features/csv-import/CsvImportWizard';
import { SettingsPage } from './features/settings/SettingsPage';
import { NavigationTab } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<string>(
    'Lahey Hospital & Medical Center (Burlington)'
  );
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: '2020-01-01',
    endDate: '2021-11-30',
  });

  return (
    <div className="h-screen w-screen bg-[#fafbfc] text-slate-900 font-sans flex overflow-hidden">
      {/* Sidebar Navigation - Stays stationary */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        hospitalName={selectedHospital}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Full Top Navbar - Permanently fixed / stationary on scroll */}
        <TopNavbar
          currentTab={currentTab}
          onNavigate={setCurrentTab}
          selectedHospital={selectedHospital}
          onSelectHospital={setSelectedHospital}
          onToggleSidebarMobile={() => setIsMobileSidebarOpen(true)}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onDateRangeChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
        />

        {/* Scrollable Page Body - Content scrolls smoothly beneath TopNavbar */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl w-full mx-auto pb-16">
            {currentTab === 'overview' && (
              <OverviewPage
                onNavigate={setCurrentTab}
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
              />
            )}
            {currentTab === 'trends' && (
              <DiseaseTrendsPage simpleMode={true} />
            )}
            {currentTab === 'forecast' && (
              <ForecastExplorerPage />
            )}
            {currentTab === 'supply-demand' && (
              <SupplyDemandPage />
            )}
            {currentTab === 'models' && (
              <ModelPerformancePage simpleMode={true} />
            )}
            {currentTab === 'data-management' && (
              <DataManagementPage onNavigate={setCurrentTab} />
            )}
            {currentTab === 'import-history' && (
              <ImportHistoryPage onNavigate={setCurrentTab} />
            )}
            {currentTab === 'csv-import' && (
              <CsvImportWizard onNavigate={setCurrentTab} />
            )}
            {currentTab === 'settings' && (
              <SettingsPage />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
