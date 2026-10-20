import React, { useState } from 'react';
import {
  User,
  Sliders,
  Server,
  Bell,
  Shield,
  Save,
  Check,
  CheckCircle2,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { DisclaimerBanner } from '../../components/ui/DisclaimerBanner';

interface SettingsPageProps {
  simpleMode?: boolean;
  onToggleSimpleMode?: (v: boolean) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  simpleMode = true,
  onToggleSimpleMode,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'pipeline' | 'alerts'>('profile');
  const [saveToast, setSaveToast] = useState<boolean>(false);

  // Preference states
  const [defaultDateRange, setDefaultDateRange] = useState<string>('all');
  const [defaultModel, setDefaultModel] = useState<string>('sarima');
  const [defaultConfidenceBand, setDefaultConfidenceBand] = useState<string>('95');
  const [surgeAlertThreshold, setSurgeAlertThreshold] = useState<number>(15);

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <DisclaimerBanner customMessage="Preferences and backend configuration endpoints are functional in frontend mock state. In production, system settings will synchronize with hospital directory permissions and Python API endpoints." />

      {saveToast && (
        <div className="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center justify-between border border-slate-700">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-400" />
            <span>Settings saved successfully in local profile.</span>
          </div>
          <span className="text-[10px] text-slate-400">Synchronized</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>User Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'preferences'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Dashboard Preferences</span>
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'pipeline'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Pipeline & API Architecture</span>
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'alerts'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Surveillance Alerts</span>
        </button>
      </div>

      {/* TAB 1: User Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Hospital Practitioner Profile</h3>
            <p className="text-xs text-slate-500">Clinical identity and institutional affiliation</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 text-white font-bold text-lg flex items-center justify-center">
              EV
            </div>
            <div>
              <div className="font-semibold text-slate-900">Dr. Evelyn Vance, MD, MPH</div>
              <div className="text-xs text-slate-500">Chief Epidemiologist & Infection Prevention Officer</div>
              <span className="inline-block mt-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verified Surveillance Lead
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value="evelyn.vance@stjude-hospital.org"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Primary Hospital Facility</label>
              <input
                type="text"
                disabled
                value="St. Jude Memorial Hospital (Main Campus)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Dashboard Preferences */}
      {activeTab === 'preferences' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Dashboard & Display Defaults</h3>
            <p className="text-xs text-slate-500">Customize default parameters when opening surveillance pages</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Default Reading Experience
              </label>
              <select
                value={simpleMode ? 'simple' : 'detailed'}
                onChange={(e) => onToggleSimpleMode?.(e.target.value === 'simple')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="simple">Simple & Clear (Recommended for general hospital staff)</option>
                <option value="detailed">Detailed View (Includes statistical formulas and technical parameters)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Simple view removes complex jargon and focuses on what cases to prepare for.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Default Historical Date Range
              </label>
              <select
                value={defaultDateRange}
                onChange={(e) => setDefaultDateRange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="all">Full Baseline Window (33 Months, Jan 2024 – Sep 2026)</option>
                <option value="12m">Rolling 12 Months</option>
                <option value="24m">Rolling 24 Months</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Default Forecasting Engine
              </label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="sarima">SARIMA v1.4.2 (Lowest WAPE: 6.8%)</option>
                <option value="ensemble">Hybrid Ensemble v1.1</option>
                <option value="ets">ETS Triple-Exp v2.1</option>
                <option value="snaive">Seasonal Naive Benchmark</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Default Prediction Interval Band
              </label>
              <select
                value={defaultConfidenceBand}
                onChange={(e) => setDefaultConfidenceBand(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="95">95% Uncertainty Interval (Standard for Hospital Planning)</option>
                <option value="80">80% Uncertainty Interval (Narrow Buffer)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Display Preferences</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Pipeline & Architecture Hooks */}
      {activeTab === 'pipeline' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Future API & Forecasting Pipeline Hooks</h3>
            <p className="text-xs text-slate-500">
              System architecture designed for integration with Python FastAPI & PostgreSQL
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <div>
                <div className="font-semibold text-slate-900">Backend API Specification</div>
                <div className="text-slate-500 text-[11px]">Python FastAPI / Pydantic models</div>
              </div>
              <span className="font-mono text-teal-700 font-medium">http://localhost:8000/api/v1</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <div>
                <div className="font-semibold text-slate-900">Primary Database Engine</div>
                <div className="text-slate-500 text-[11px]">PostgreSQL 16 + SQLAlchemy / TimescaleDB</div>
              </div>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready for Migration</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">Forecasting Library Stack</div>
                <div className="text-slate-500 text-[11px]">statsmodels (SARIMAX), scikit-learn, pandas</div>
              </div>
              <span className="font-mono text-slate-600">statsmodels &gt;= 0.14</span>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            <div className="font-semibold text-slate-700 mb-1">Prepared Mock API Service Layer</div>
            <p className="leading-relaxed">
              The frontend features an isolated API service abstraction (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">src/lib/services/apiMock.ts</code>). Replacing mock promises with REST/GraphQL calls connects the application to real hospital endpoints with zero component rewriting.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: Alerts */}
      {activeTab === 'alerts' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Hospital Epidemiological Surge Alerts</h3>
            <p className="text-xs text-slate-500">Threshold triggers for capacity planning and infection control notifications</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Surge Trigger Threshold (% YoY Increase)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={surgeAlertThreshold}
                  onChange={(e) => setSurgeAlertThreshold(parseInt(e.target.value, 10))}
                  className="flex-1"
                />
                <span className="font-bold text-slate-900 tabular-nums w-12 text-right">
                  +{surgeAlertThreshold}%
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                Alerts Infection Control if forecasted volume exceeds baseline by this margin.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-teal-600" />
                <span className="text-slate-700">Send notification when pre-ingestion validation encounters &gt;10 row errors</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-teal-600" />
                <span className="text-slate-700">Flag prospective winter surge bed occupancy alerts for Respiratory conditions</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Alert Thresholds</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
