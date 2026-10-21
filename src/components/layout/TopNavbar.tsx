import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Calendar,
  Building2,
  ChevronDown,
  Upload,
  User,
  Shield,
  LogOut,
  AlertTriangle,
  Info,
  CheckCircle2,
  Menu,
  X,
  Clock,
  Check,
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface TopNavbarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  selectedHospital: string;
  onSelectHospital: (hospital: string) => void;
  onToggleSidebarMobile?: () => void;
  startDate?: string;
  endDate?: string;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
}

const PAGE_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Ringkasan Kasus (Overview)',
    subtitle: 'Pantauan utama volume pasien dan prakiraan bulan depan',
  },
  trends: {
    title: 'Tren Penyakit (Disease Trends)',
    subtitle: 'Grafik riwayat kasus bulanan dan perbandingan tahunan',
  },
  forecast: {
    title: 'Prakiraan Masa Depan (Forecast Explorer)',
    subtitle: 'Perkiraan jumlah pasien untuk perencanaan tempat tidur & nakes',
  },
  models: {
    title: 'Evaluasi Prediksi (Model Performance)',
    subtitle: 'Tingkat akurasi sistem prediksi dan perbandingan metode',
  },
  'data-management': {
    title: 'Data Rumah Sakit (Data Management)',
    subtitle: 'Daftar rekam medis dan dataset kunjungan yang tercatat',
  },
  'import-history': {
    title: 'Riwayat Unggahan (Import History)',
    subtitle: 'Catatan berkas CSV yang telah diunggah ke sistem',
  },
  'csv-import': {
    title: 'Unggah Berkas CSV (CSV Import)',
    subtitle: 'Panduan mudah memasukkan data kunjungan pasien baru',
  },
  settings: {
    title: 'Pengaturan Sistem (Settings)',
    subtitle: 'Preferensi tampilan, notifikasi, dan profil pengguna',
  },
};

const HOSPITALS = [
  { id: 'h1', name: 'Lahey Hospital & Medical Center (Burlington)', isDefault: true },
  { id: 'h2', name: 'North Shore Medical Center (Salem)', isDefault: false },
  { id: 'h3', name: 'Mount Auburn Hospital (Cambridge)', isDefault: false },
  { id: 'h4', name: 'Beth Israel Deaconess Hospital (Plymouth)', isDefault: false },
  { id: 'h5', name: 'Cambridge Health Alliance (Cambridge)', isDefault: false },
];

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab,
  onNavigate,
  selectedHospital,
  onSelectHospital,
  onToggleSidebarMobile,
  startDate: propStartDate = '2020-01-01',
  endDate: propEndDate = '2022-05-31',
  onDateRangeChange,
}) => {
  const [hospitalDropdownOpen, setHospitalDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState(propStartDate);
  const [endDate, setEndDate] = useState(propEndDate);
  const [filterMode, setFilterMode] = useState<'year' | 'flexible'>('year');
  const [selectedRange, setSelectedRange] = useState(
    `${propStartDate.substring(0, 7)} s/d ${propEndDate.substring(0, 7)}`
  );

  useEffect(() => {
    setStartDate(propStartDate);
    setEndDate(propEndDate);
    setSelectedRange(`${propStartDate.substring(0, 7)} s/d ${propEndDate.substring(0, 7)}`);
  }, [propStartDate, propEndDate]);

  const hospitalRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Peringatan Musiman Flu',
      message: 'Kasus Influenza diprediksi naik +15% pada bulan depan (Nov 2026).',
      time: '15 menit lalu',
      type: 'warning',
      read: false,
    },
    {
      id: 'n2',
      title: 'Data Baru Terverifikasi',
      message: 'Data kunjungan September 2026 (1.240 baris) berhasil divalidasi.',
      time: '2 jam lalu',
      type: 'success',
      read: false,
    },
    {
      id: 'n3',
      title: 'Jadwal Prakiraan Siap',
      message: 'Model SARIMA telah memperbarui estimasi kasus 6 bulan mendatang.',
      time: '1 hari lalu',
      type: 'info',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (hospitalRef.current && !hospitalRef.current.contains(target)) {
        setHospitalDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(target)) {
        setDateFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageInfo = PAGE_TITLES[currentTab] || {
    title: 'EpiTrend Dashboard',
    subtitle: 'Sistem Pemantauan Tren Penyakit',
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 sticky top-0 shadow-xs">
      {/* Left side: Mobile menu toggle + Current Page Header */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebarMobile && (
          <button
            onClick={onToggleSidebarMobile}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="truncate">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
              {pageInfo.title}
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 truncate hidden md:block">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right side: Hospital Selector, Date filter, Upload Button, Notification, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Hospital Selector Dropdown */}
        <div className="relative hidden md:block" ref={hospitalRef}>
          <button
            onClick={() => setHospitalDropdownOpen(!hospitalDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span className="max-w-[160px] truncate">{selectedHospital.replace(' (Main Campus)', '')}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {hospitalDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Pilih Fasilitas Kesehatan
              </div>
              {HOSPITALS.map((h) => {
                const isSelected = selectedHospital.includes(h.name.split(' (')[0]);
                return (
                  <button
                    key={h.id}
                    onClick={() => {
                      onSelectHospital(h.name);
                      setHospitalDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      isSelected ? 'text-teal-700 font-semibold bg-teal-50/50' : 'text-slate-700'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate font-medium">{h.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {h.isDefault ? 'Fasilitas Utama Terhubung' : 'Cabang Satelit'}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Date Range */}
        <div className="relative hidden xl:block" ref={dateRef}>
          <button
            onClick={() => setDateFilterOpen(!dateFilterOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{selectedRange}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {dateFilterOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  Filter Periode Data
                </span>
                <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
                  Surveilans
                </span>
              </div>

              {/* Mode Toggle: Tab 1 (Pilih Tahun Langsung) vs Tab 2 (Rentang Fleksibel) */}
              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg mb-3">
                <button
                  type="button"
                  onClick={() => setFilterMode('year')}
                  className={`flex-1 py-1.5 text-center text-[11px] font-semibold rounded-md transition-all ${
                    filterMode === 'year'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Pilih Tahun
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('flexible')}
                  className={`flex-1 py-1.5 text-center text-[11px] font-semibold rounded-md transition-all ${
                    filterMode === 'flexible'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Fleksibel (Kustom)
                </button>
              </div>

              {/* MODE 1: PILIH TAHUN LANGSUNG */}
              {filterMode === 'year' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Pilih tahun spesifik untuk melihat tren kasus dan prakiraan setahun penuh:
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { year: '2021', label: 'Tahun 2021', desc: 'Tahun Terakhir', default: true },
                      { year: '2020', label: 'Tahun 2020', desc: 'Awal Pandemi' },
                      { year: '2019', label: 'Tahun 2019', desc: 'Pra-Pandemi' },
                      { year: '2018', label: 'Tahun 2018', desc: 'Baseline Awal' },
                    ].map((item) => {
                      const isCurrentYear =
                        startDate.startsWith(item.year) && endDate.startsWith(item.year);
                      return (
                        <button
                          key={item.year}
                          type="button"
                          onClick={() => {
                            const newStart = `${item.year}-01-01`;
                            const newEnd = `${item.year}-12-31`;
                            setStartDate(newStart);
                            setEndDate(newEnd);
                            setSelectedRange(`Tahun ${item.year}`);
                            if (onDateRangeChange) {
                              onDateRangeChange(newStart, newEnd);
                            }
                            setDateFilterOpen(false);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isCurrentYear
                              ? 'border-teal-500 bg-teal-50/70 text-teal-900 font-bold ring-1 ring-teal-500'
                              : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tombol Semua Tahun */}
                  <button
                    type="button"
                    onClick={() => {
                      const newStart = '2018-01-01';
                      const newEnd = '2021-12-31';
                      setStartDate(newStart);
                      setEndDate(newEnd);
                      setSelectedRange('Semua Tahun (2018–2021)');
                      if (onDateRangeChange) {
                        onDateRangeChange(newStart, newEnd);
                      }
                      setDateFilterOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 text-center transition-colors text-[11px]"
                  >
                    Semua Tahun (2018 s/d 2021)
                  </button>
                </div>
              )}

              {/* MODE 2: RENTANG FLEKSIBEL (KUSTOM DARI TANGGAL S/D TANGGAL) */}
              {filterMode === 'flexible' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Dari Tanggal:
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Sampai Tanggal:
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Preset Cepat */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1.5">
                      Preset Cepat
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setStartDate('2021-01-01');
                          setEndDate('2021-11-30');
                        }}
                        className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md text-left transition-colors"
                      >
                        Jan–Nov 2021
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStartDate('2020-01-01');
                          setEndDate('2021-11-30');
                        }}
                        className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md text-left transition-colors"
                      >
                        2 Tahun Terakhir
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setDateFilterOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const startShort = startDate.substring(0, 7);
                        const endShort = endDate.substring(0, 7);
                        setSelectedRange(`${startShort} s/d ${endShort}`);
                        if (onDateRangeChange) {
                          onDateRangeChange(startDate, endDate);
                        }
                        setDateFilterOpen(false);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
                    >
                      Terapkan Rentang
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Upload Action - Neutral clean styling */}
        <button
          onClick={() => onNavigate('csv-import')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
          title="Unggah CSV"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Unggah CSV</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Pemberitahuan"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">Pemberitahuan Rumah Sakit</span>
                  {unreadCount > 0 && (
                    <span className="bg-teal-50 text-teal-700 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-medium text-teal-600 hover:text-teal-800"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-1">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`py-2.5 px-2 rounded-lg transition-colors flex items-start gap-2.5 ${
                      !item.read ? 'bg-slate-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.type === 'warning' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      ) : item.type === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-teal-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">{item.title}</span>
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setNotificationOpen(false);
                    onNavigate('overview');
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center shrink-0">
              EV
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-tight">Dr. Evelyn</div>
              <div className="text-[10px] text-slate-500 leading-none">Staf Medis</div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-900">Dr. Evelyn Vance</div>
                <div className="text-[11px] text-slate-500">Chief Epidemiologist</div>
                <div className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                  Akses: Rumah Sakit & Surveilans
                </div>
              </div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate('settings');
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                Pengaturan Profil
              </button>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate('csv-import');
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                Unggah Dataset Baru
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  setProfileOpen(false);
                  alert('Sesi simulasi aktif');
                }}
                className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar (Demo)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
