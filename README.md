# EpiTrend — Disease Trend Forecasting & Surveillance Ecosystem

EpiTrend adalah sistem surveilans epidemiologi dan peramalan tren kasus penyakit musiman tingkat fasilitas kesehatan/rumah sakit. Sistem ini mengintegrasikan data rekam medis pasien (rekam kunjungan dan diagnosis ICD-10/SNOMED) untuk menghasilkan proyeksi beban kasus di masa mendatang serta membantu perencanaan alokasi logistik farmasi (kebutuhan vs ketersediaan obat).

---

## 🏛️ Arsitektur Ekosistem & Multi-Repo

Ekosistem EpiTrend dibangun di atas arsitektur monorepo modular yang membagi layanan ke dalam 3 aplikasi independen serta database PostgreSQL di cloud:

```
epitrend-ecosystem/
├── apps/
│   ├── dashboard/       # Frontend Surveilans & Analitik (Port 3000)
│   ├── api/             # Backend Sentral Express & Machine Learning (Port 5000)
│   └── patient-intake/  # Portal Entri Pasien & Diagnosis ICD-10 (Port 3001)
├── csv/                 # Dataset Rekam Medis (Synthea)
└── supabase-schema.sql  # DDL Skema Relasional & SQL View
```

- **`apps/dashboard`** (`epitrend-health/dashboard-web`): React + Vite + TailwindCSS + Recharts.
- **`apps/api`** (`epitrend-health/hospital-core-api`): Node.js + Express + TypeScript + Supabase Client + Python SARIMA.
- **`apps/patient-intake`** (`epitrend-health/patient-intake-web`): React + Vite + TailwindCSS + Lucide.
- **Database**: Supabase PostgreSQL Cloud (Tabel `patients`, `conditions`, `encounters`, `organizations`, dan View `monthly_disease_cases`).

---

## 🔄 Data Flowchart (Alur Data)

Alur pergerakan data dari input rekam medis hingga menghasilkan proyeksi analitik:

```mermaid
flowchart TD
    subgraph Data_Sources["Sumber Data Pasien"]
        A1["Form Input Pasien & ICD-10<br/>(apps/patient-intake)"]
        A2["Unggah File CSV Rekam Medis<br/>(apps/dashboard CsvImportWizard)"]
        A3["Batch Seeding Dataset Synthea<br/>(scripts/seed-csv.ts)"]
    end

    subgraph Backend_API["Central Backend API (apps/api - Port 5000)"]
        B1["POST /api/patients"]
        B2["POST /api/imports/upload"]
        B3["Data Ingestion & Sanitization Engine"]
        B4["Epidemiology SARIMA Analytics Engine"]
    end

    subgraph Database["Supabase PostgreSQL Cloud"]
        DB1[("Tabel: patients")]
        DB2[("Tabel: conditions")]
        DB3[("Tabel: encounters")]
        V1[["SQL View: monthly_disease_cases"]]
    end

    subgraph Analytics_API["Endpoints Konsumsi Data"]
        C1["GET /api/diseases"]
        C2["GET /api/cases"]
        C3["GET /api/forecast?cutoffMonth=..."]
        C4["GET /api/supply-demand"]
    end

    subgraph Dashboard_UI["Frontend Surveillance Dashboard (apps/dashboard)"]
        D1["Ringkasan (Overview)<br/>4 KPI Cards + Grafik Tren"]
        D2["Tren Penyakit (Disease Trends)<br/>Riwayat Bulanan & Perbandingan"]
        D3["Prakiraan Kasus (Forecast Explorer)<br/>Model SARIMA 6 Bulan ke Depan"]
        D4["Kebutuhan & Stok Obat (Supply vs Demand)<br/>Analisis Defisit / Surplus Farmasi"]
    end

    A1 -->|HTTP POST| B1
    A2 -->|Multipart CSV| B2
    A3 -->|Script Seeder| B3

    B1 --> B3
    B2 --> B3
    B3 -->|Insert / Upsert| DB1
    B3 -->|Insert / Upsert| DB2
    B3 -->|Insert / Upsert| DB3

    DB1 -.-> V1
    DB2 -.-> V1
    DB3 -.-> V1

    V1 -->|Query Data Kasus| B4
    B4 --> C1
    B4 --> C2
    B4 --> C3
    B4 --> C4

    C1 --> Dashboard_UI
    C2 --> D2
    C3 --> D1
    C3 --> D3
    C4 --> D4
```

---

## 👤 User Flow (Alur Pengguna)

Alur kerja petugas medis dan pengambil kebijakan saat menggunakan EpiTrend:

```mermaid
flowchart TD
    Start([Pengguna Mengakses Sistem]) --> RoleCheck{Peran Pengguna?}

    %% Alur Petugas Pendaftaran / Staf Medis
    RoleCheck -->|Staf Medis / Intake| P1["Buka Portal Patient Intake (:3001)"]
    P1 --> P2["Isi Data Pasien:<br/>Nama, MRN, Umur, Gender, Tanggal"]
    P2 --> P3["Pilih Diagnosis Penyakit / Kode ICD-10"]
    P3 --> P4["Klik 'Daftarkan Pasien'"]
    P4 --> P5{"Apakah Input Valid?"}
    P5 -->|Tidak| P2
    P5 -->|Ya| P6["Kirim ke API /api/patients"]
    P6 --> P7["Data Tersimpan di Database Supabase"]
    P7 --> P8["Live Feed Pasien Terupdate Otomatis"]

    %% Alur Staf Surveilans & Manajemen RS
    RoleCheck -->|Epidemiolog / Manajemen| D1["Buka Surveillance Dashboard (:3000)"]
    D1 --> D2["Tentukan Filter Rentang Waktu"]
    D2 --> ModeChoice{Pilih Mode Filter}
    ModeChoice -->|Pilih Tahun Langsung| D3A["Klik Tombol Tahun:<br/>2021, 2020, 2019, 2018, Semua"]
    ModeChoice -->|Fleksibel (Kustom)| D3B["Pilih Dari Tanggal & Sampai Tanggal<br/>lalu Klik 'Terapkan Rentang'"]

    D3A --> D4["Sistem Memuat Data Historis & Model SARIMA"]
    D3B --> D4

    D4 --> D5{"Pilih Menu Analisis"}
    D5 -->|Ringkasan| M1["Lihat Metrik Utama & Grafik Proyeksi 6 Bulan"]
    D5 -->|Tren Penyakit| M2["Analisis Kasus Historis per Penyakit"]
    D5 -->|Prakiraan Kasus| M3["Eksplorasi Proyeksi Multi-Penyakit & Confidence Interval"]
    D5 -->|Kebutuhan & Stok| M4["Cek Kebutuhan Obat vs Alokasi Stok RS (Defisit / Surplus)"]
    D5 -->|Unggah CSV| M5["Upload File Rekam Medis Bulanan Baru"]

    M5 --> U1["Tarik File .csv ke Area Unggah"]
    U1 --> U2["Sistem Memvalidasi Format Kolom"]
    U2 --> U3["Simpan ke Database Supabase"]
    U3 --> D4
```

---

## 🚀 Panduan Menjalankan Sistem Secara Lokal

### Prasyarat
- Node.js (v18+)
- npm atau bun
- Akun Supabase (PostgreSQL Cloud)

### 1. Kloning Repositori
```bash
git clone https://github.com/epitrend-health/dashboard-web.git
cd epitrend-—-disease-trend-forecasting-dashboard
```

### 2. Instalasi Dependensi
```bash
# Install root & workspace dependencies
npm install
cd apps/dashboard && npm install
cd ../api && npm install
cd ../patient-intake && npm install
cd ../..
```

### 3. Konfigurasi Environment Variable
Salin `.env.example` ke file `.env` di masing-masing sub-proyek:
- **`apps/api/.env`**:
  ```env
  PORT=5000
  SUPABASE_URL="https://<project-ref>.supabase.co"
  SUPABASE_SERVICE_ROLE_KEY="<service-role-secret>"
  CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
  ```
- **`apps/dashboard/.env`**:
  ```env
  VITE_API_BASE_URL="http://localhost:5000/api"
  VITE_USE_MOCK_DATA="false"
  ```
- **`apps/patient-intake/.env`**:
  ```env
  VITE_API_BASE_URL="http://localhost:5000/api"
  ```

### 4. Setup Database & Seeding
1. Eksekusi query DDL yang ada di `apps/api/supabase-schema.sql` pada **SQL Editor Dashboard Supabase**.
2. Jalankan batch seeder untuk mengisi data awal:
   ```bash
   npm run seed:data
   ```

### 5. Menjalankan Semua Layanan
Jalankan dev server secara paralel:
```bash
npm run dev
```
Aplikasi akan tersedia di:
- **Dashboard Surveilans:** `http://localhost:3000`
- **Portal Entri Pasien:** `http://localhost:3001`
- **Core API Backend:** `http://localhost:5000`

---

## 📋 Lisensi
Proyek ini didistribusikan di bawah lisensi **Apache-2.0**.
