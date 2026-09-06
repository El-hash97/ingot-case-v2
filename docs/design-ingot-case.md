---
name: Ingot Case Cyberbrutalist Design System
description: Industrial Cyberbrutalist design spec for factory shop-floor monitoring applications.
colors:
  primary-blue: "#2563EB"
  accent-lime: "#D4FF00"
  alert-red: "#EF4444"
  background: "#F4F4F0"
  surface: "#FFFFFF"
  terminal-bg: "#090D16"
  text-primary: "#0A0A0A"
  text-muted: "#525252"
  border: "#000000"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "2rem"
    fontWeight: "800"
    lineHeight: "1.1"
    letterSpacing: "-0.02em"
    textTransform: "uppercase"
  heading-sm:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "1.25rem"
    fontWeight: "700"
    letterSpacing: "-0.01em"
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: "500"
    lineHeight: "1.5"
  mono-code:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: "600"
    textTransform: "uppercase"
rounded:
  none: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
borders:
  hairline: "1px solid #000000"
  thick: "2px solid #000000"
shadows:
  hard-sm: "2px 2px 0px #000000"
  hard-md: "4px 4px 0px #000000"
---

## Overview
Design system ini memadukan estetika **Cyberbrutalism** dengan kebutuhan antarmuka pabrik (*shop-floor*). Mengutamakan kejelasan data (*high-contrast*), kemudahan interaksi pada layar sentuh tablet, serta pencegahan kesalahan kerja (*zero rounded corners*, *bold borders*, *retro CLI elements*).

## Colors
- **Primary Electric Blue (`#2563EB`):** Digunakan untuk navigasi utama, status normal, dan header window standar.
- **Acid Lime Green (`#D4FF00`):** Warna perhatian tinggi untuk tombol aksen/CTA utama, sinyal *Warning (80%)*, dan elemen header statistik aktif.
- **Alert Red (`#EF4444`):** Digunakan khusus untuk kondisi kritis *NG ($\ge$ 20.000 kg)* dan tombol konfirmasi destruktif.
- **Border (`#000000`):** Garis batas hitam solid 2px wajib ada pada setiap card, tombol, dan input form.

## Typography
- **Headings (Space Grotesk):** Judul utama dan nama section menggunakan font sans-serif industrial tebal dengan gaya *uppercase* dan akhiran underscore (contoh: `DASHBOARD_`).
- **Body (Inter):** Untuk keterbacaan teks deskriptif dan nilai angka yang jernih.
- **Mono (JetBrains Mono):** Digunakan pada header window OS (`[SKILLS.EXE]`, `[SHIFT_LOG.SH]`), *tech tags*, dan teks log terminal.

## Spacing & Layout
- Berbasis **8px grid system** yang rapat (*dense layout*).
- Pemisahan visual antar komponen tidak mengandalkan *whitespace* luas, melainkan menggunakan garis pembatas *2px solid black border*.

## Shapes & Elevation
- **Border Radius:** Murni `0px` (serba siku/tajam). Tidak diperbolehkan ada lengkungan (`rounded-md`, `rounded-full` dilarang kecuali untuk indikator status bulat kecil).
- **Elevation:** Tanpa *soft blur shadow*. Menggunakan *hard offset shadow* `2px 2px 0px #000000` atau `4px 4px 0px #000000`.

## Component Patterns
1. **Retro Window Container:** Card dengan header berwarna (Biru/Lime/Hitam) berisi teks monospace judul window di kiri dan simbol kontrol retro `_ □ X` di kanan.
2. **Brutalist Button:** Tombol latar warna solid dengan border hitam 2px dan bayangan keras. Saat di-*hover*, tombol bergeser `-2px -2px` dan bayangan membesar menjadi `4px 4px 0px #000000`.
3. **Status Cards:** Menampilkan *progress bar* garis solid hitam tanpa *gradient*.

## Rules to Never Break
- **Dilarang menggunakan soft drop-shadow, blur effect, atau gradient background.**
- **Dilarang menggunakan border-radius > 0px pada card, input, maupun tombol.**
- **Setiap elemen UI wajib dibatasi oleh border hitam solid minimal 1px/2px.**