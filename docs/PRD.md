# Product Requirement Document (PRD)
## Aplikasi Monitoring Tonase Ingot Case (Pouring Line)

---

## 1. Document Control & Overview

| Document Attribute | Details |
| :--- | :--- |
| **Project Name** | Ingot Case Tonnage Monitoring System |
| **Document Version** | v1.0.0 |
| **Status** | Approved / Ready for Development |
| **Target Users** | Operator Line Pouring, Leader / Supervisor Maintenance & Production |
| **Platform** | Web-Based (Desktop & Tablet Friendly) |

---

## 2. Product Vision & Goals

### 2.1 Background
Pada *line pouring*, *ingot case* memiliki batas umur pakai berdasarkan akumulasi beban tonase yang diterimanya. Penggunaan *ingot case* yang melebihi batas kekuatan struktural dapat menyebabkan keretakan, kebocoran cairan logam, kerusakan *mold*, *downtime* produksi, serta risiko keselamatan kerja.

### 2.2 System Metrics & Business Rules
* **Kapasitas Penuh Default (Per Pouring):** 600 kg.
* **Batas Maksimal Umur Ingot Case:** 20.000 kg (100%).
* **Status NG (Not Fit for Use):** $\ge$ 20.000 kg. *Ingot case* wajib di-terima/lock dan tidak boleh digunakan lagi.
* **Batas Early Warning (Kuning):** 16.000 kg (80%). Sinyal persiapan unit pengganti.
* **Estimasi Jumlah Unit:** 20 unit (*scalable*, dapat ditambah dinamis oleh Leader).
* **Rata-rata Penggunaan Per Shift:** $pprox 6$ pcs *ingot case*.

### 2.3 Primary Goals
1. **Zero Over-Tonnage Incident:** Mencegah penggunaan *ingot case* yang sudah $\ge$ 20.000 kg secara otomatis melalui sistem *lock*.
2. **Early Warning System:** Memberikan notifikasi saat *ingot case* mencapai 80% masa pakai (16.000 kg).
3. **Efisiensi Input Operator:** Mempermudah pencatatan akhir *shift* dengan sistem *batch selection*, *default full weight* (600 kg), dan penyesuaian fleksibel untuk penuangan parsial.
4. **Full Audit Trail & Traceability:** Menyediakan riwayat lengkap penuangan, perbaikan/reset, dan *scraping* *ingot case*.

---

## 3. User Roles & Access Control (RBAC)

| Feature / Action | Operator | Leader / Supervisor |
| :--- | :---: | :---: |
| Lihat Dashboard Status Ingot Case | ✅ | ✅ |
| Input Log Penuangan Akhir Shift | ✅ | ✅ |
| Kelola Header Laporan (Tanggal, Shift Red/White, Day/Night) | ✅ | ✅ |
| Tambah / Edit Data Master Ingot Case | ❌ | ✅ |
| Reset Status Tonase (Refurbish / Overhaul) + Catatan | ❌ | ✅ |
| Non-aktifkan / Scrap Ingot Case Permanen | ❌ | ✅ |
| Lihat History & Export Laporan (Excel / CSV / PDF) | ❌ | ✅ |
| Manajemen User & Hak Akses | ❌ | ✅ |

---

## 4. Functional Requirements & Core Features

### 4.1 Header Laporan Harian / Shift (Shift Metadata)
* **Atribut Input:**
  * **Tanggal:** Datepicker (default: Hari Ini).
  * **Shift Color:** Dropdown (`Red` / `White`).
  * **Time Period:** Dropdown (`Day` / `Night`).
  * **Nama Operator:** Auto-filled / Select dari user terautentikasi.

### 4.2 Entry Log Penuangan Akhir Shift (Batch Pouring Input)
* **Workflow Input:**
  1. Operator mengisi Header Shift (Tanggal, Shift Color, Time Period).
  2. Operator memilih nomor *Ingot Case* yang digunakan pada *shift* tersebut (misal: 6 pcs).
  3. Sistem membuat daftar input dinamis untuk *ingot case* terpilih:
     * Nilai *default* tonase terisi **600 kg** (Full).
     * Kolom tonase dapat diedit secara fleksibel (misal *ingot case* paling akhir diisi 350 kg).
  4. Validation Engine:
     * Jika ada *ingot case* terpilih yang sudah berstatus **NG** ($\ge$ 20.000 kg), sistem memblokir submit dan menampilkan *error alert*.
     * Jika penuangan akan menyebabkan tonase melewati 20.000 kg, sistem menampilkan konfirmasi peringatan.
  5. Saat di-submit, sistem secara otomatis mengkalkulasi dan mengupdate akumulasi tonase tiap *ingot case*.

### 4.3 Interactive Visual Dashboard
* **Grid Display (Card View):**
  * Menampilkan seluruh *Ingot Case* (default 20 unit + tambahan).
  * **Color Code System:**
    * **Hijau (Aman):** Tonase < 16.000 kg.
    * **Kuning (Warning - 80%):** 16.000 kg $\le$ Tonase < 20.000 kg.
    * **Merah (NG / Retired):** Tonase $\ge$ 20.000 kg.
  * **Indikator Visual:**
    * Nomor Ingot Case.
    * Progress bar persentase ($rac{	ext{Tonase Saat Ini}}{20.000} 	imes 100\%$).
    * Angka Akumulasi Tonase (contoh: `14.200 / 20.000 kg`).
    * Jumlah siklus penuangan (*pouring count*).
    * Tag status (`Normal`, `Warning`, `NG`, `Scrapped`).

### 4.4 Management & Maintenance Lifecycle (Leader Only)
* **Tambah Ingot Case Baru:** Menginput Kode/Nomor Ingot Case baru dengan tonase awal 0 kg.
* **Reset / Refurbish Flow:**
  * Digunakan jika *ingot case* selesai direparasi/reondisi.
  * Leader wajib menginput **Alasan / Catatan Maintenance** (misal: *Ganti lining / overhaul body*).
  * Tonase di-reset menjadi 0 kg, dan catatan tersimpan di `Maintenance_Logs`.
* **Scrap / Decommission:**
  * Mengubah status *ingot case* menjadi `Scrapped` secara permanen sehingga tidak muncul di opsi input penuangan.

### 4.5 Reporting & History Audit
* Log penuangan per *shift* beserta detail operator.
* History pergerakan tonase *Ingot Case* dari waktu ke waktu.
* Filter berdasarkan tanggal, shift, status ingot case, dan ID ingot case.
* Fitur Export data ke format Excel (`.xlsx`) dan CSV.

---

## 5. Proposed Tech Stack

### 5.1 Frontend
* **Framework:** Next.js 14+ (React dengan App Router & TypeScript).
* **Styling:** Tailwind CSS + Shadcn UI (UI Komponen modern & responsif untuk Tablet/Mobile shop-floor).
* **State & Fetching:** React Query / TanStack Query (Caching & Real-time Auto-refetch).
* **Icons:** Lucide React.

### 5.2 Backend & API
* **Runtime / Framework:** Node.js + Next.js API Routes (atau Express.js / NestJS jika dipisah).
* **ORM:** Prisma ORM / TypeORM (Type-safe database query & migration tool).
* **Real-time Sync:** WebSockets (Socket.io) / Server-Sent Events (SSE) untuk update dashboard otomatis saat ada operator lain yang submit data.

### 5.3 Database
* **Relational Database:** PostgreSQL / MySQL.
* **Reasoning:** Membutuhkan integritas transaksi data (ACID) yang ketat untuk pencatatan akumulasi tonase dan audit log.

### 5.4 Deployment & Infrastructure
* **Containerization:** Docker & Docker Compose.
* **Web Server / Reverse Proxy:** Nginx.
* **Environment:** On-Premise Local Plant Server / Cloud VM (Ubuntu Linux).

---

## 6. Database Schema Design (ERD Concept)

```sql
-- Table: Users
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('OPERATOR', 'LEADER')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Ingot Cases
CREATE TABLE ingot_cases (
    id VARCHAR(36) PRIMARY KEY,
    case_number VARCHAR(50) UNIQUE NOT NULL,
    total_tonnage_kg DECIMAL(10,2) DEFAULT 0.00,
    max_tonnage_kg DECIMAL(10,2) DEFAULT 20000.00,
    warning_tonnage_kg DECIMAL(10,2) DEFAULT 16000.00,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'WARNING', 'NG', 'SCRAPPED')),
    cycle_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Shift Logs
CREATE TABLE shift_logs (
    id VARCHAR(36) PRIMARY KEY,
    log_date DATE NOT NULL,
    shift_color VARCHAR(10) NOT NULL CHECK (shift_color IN ('RED', 'WHITE')),
    time_period VARCHAR(10) NOT NULL CHECK (time_period IN ('DAY', 'NIGHT')),
    operator_id VARCHAR(36) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Pouring Entries
CREATE TABLE pouring_entries (
    id VARCHAR(36) PRIMARY KEY,
    shift_log_id VARCHAR(36) REFERENCES shift_logs(id) ON DELETE CASCADE,
    ingot_case_id VARCHAR(36) REFERENCES ingot_cases(id),
    weight_kg DECIMAL(10,2) NOT NULL DEFAULT 600.00,
    tonnage_after DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Maintenance / Audit Logs
CREATE TABLE maintenance_logs (
    id VARCHAR(36) PRIMARY KEY,
    ingot_case_id VARCHAR(36) REFERENCES ingot_cases(id),
    leader_id VARCHAR(36) REFERENCES users(id),
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('RESET', 'SCRAP', 'CREATE')),
    tonnage_before DECIMAL(10,2) NOT NULL,
    notes TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. Non-Functional Requirements (NFR)

1. **Performance:**
   * Dashboard *initial load time* < 1.5 detik pada jaringan LAN pabrik.
   * Proses submit *batch pouring* selesai < 500 ms.
2. **Usability & UX:**
   * Interface dioptimalkan untuk perangkat Tablet 10 inch yang digunakan operator di lapangan.
   * *Touch-friendly controls* (tombol besar, minimalisasi input mengetik dengan tombol presetting).
3. **Data Integrity & Safety:**
   * Transaksi input tonase menggunakan *database ACID transaction* untuk mencegah *race condition* jika 2 operator menginput bersamaan.
   * Penambahan tonase dihitung secara atomic di level database.
4. **IoT Preparedness (Future-Proof):**
   * Backend menyediakan endpoint REST API standar (`POST /api/v1/pouring`) yang nantinya dapat dihubungkan langsung ke *Load Cell* / PLC / RFID Reader tanpa perlu merombak struktur database.

---

## 8. Development Milestones & Roadmap

* **Phase 1: Database Setup & Authentication (Week 1)**
  * Schema migration & RBAC implementation (JWT Session).
* **Phase 2: Master Ingot Case & Dashboard UI (Week 2)**
  * Dynamic Grid Dashboard, Status indicator engine, Real-time update via Socket/SSE.
* **Phase 3: Shift Header & Flexible Pouring Entry Engine (Week 3)**
  * Form input penuangan akhir shift, validation rules, default 600kg & editing mode.
* **Phase 4: Leader Control, Maintenance Log & Reporting (Week 4)**
  * Reset flow, audit logs, Excel exporter.
* **Phase 5: UAT & Production Deployment (Week 5)**
  * Testing di shop-floor bersama operator, bug fixing, On-Premise Server deployment.
