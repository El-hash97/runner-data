import { useMemo } from 'react'
import { getRecords } from '../storage'
import { todayString } from '../utils'
import './HeroPage.css'

interface Props {
  onEnter: () => void
}

const IconLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
)

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)

export default function HeroPage({ onEnter }: Props) {
  const records = useMemo(() => getRecords(), [])
  const today   = todayString()

  const todayRec   = records.filter(r => r.tanggal === today)
  const redToday   = todayRec.filter(r => r.shift === 'red').length
  const whiteToday = todayRec.filter(r => r.shift === 'white').length
  const fcToday    = todayRec.filter(r => r.runner.includes('FC') && !r.runner.includes('FCD')).length
  const fcdToday   = todayRec.filter(r => r.runner.includes('FCD')).length
  const totalToday = todayRec.length

  const fcPct  = totalToday > 0 ? (fcToday  / totalToday) * 100 : 0
  const fcdPct = totalToday > 0 ? (fcdToday / totalToday) * 100 : 0

  return (
    <div className="hero-page">

      {/* ── Top nav ── */}
      <header className="hero-nav">
        <div className="hero-nav-brand">
          <span className="hero-nav-icon"><IconLogo /></span>
          <span className="hero-nav-name">Runner</span>
        </div>
        <span className="hero-nav-tag">Casting Division · PT TMMIN</span>
      </header>

      {/* ── Main hero band ── */}
      <section className="hero-band">
        <div className="hero-content">

          {/* Left: copy */}
          <div className="hero-left">
            <span className="hero-eyebrow">FC / FCD Checksheet Online</span>
            <h1 className="hero-h1">
              Tuang.<br />
              Catat.<br />
              Pantau.
            </h1>
            <p className="hero-body">
              Sistem pencatatan dan monitoring penuangan runner FC dan FCD di Casting Division
              TMMIN. Input cepat dari HP, pantau progress per shift, dan riwayat lengkap
              tersedia kapan saja — tanpa install, tanpa login.
            </p>
            <button className="hero-cta-btn" onClick={onEnter}>
              Mulai Input <IconArrow />
            </button>
          </div>

          {/* Right: live monitor card */}
          <div className="hero-right">
            <div className="hero-monitor">
              <div className="monitor-header">
                <div className="monitor-live-badge">
                  <span className="monitor-dot" aria-hidden="true" />
                  LIVE
                </div>
                <span className="monitor-date-label">Monitor Hari Ini</span>
              </div>

              <div className="monitor-team-row">
                <div className="monitor-team red">
                  <span className="monitor-team-label">🔴 TIM RED</span>
                  <span className="monitor-team-count red-count">{redToday}</span>
                </div>
                <div className="monitor-team-sep" aria-hidden="true" />
                <div className="monitor-team white">
                  <span className="monitor-team-label">⚪ TIM WHITE</span>
                  <span className="monitor-team-count white-count">{whiteToday}</span>
                </div>
              </div>

              <div className="monitor-bars">
                <div className="monitor-bar-row">
                  <span className="bar-pair">FC</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill bar-fill-fc"
                      style={{ width: fcPct > 0 ? `${Math.max(fcPct, 6)}%` : '0%' }}
                    />
                  </div>
                  <span className="bar-val">{fcToday}</span>
                </div>
                <div className="monitor-bar-row">
                  <span className="bar-pair">FCD</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill bar-fill-fcd"
                      style={{ width: fcdPct > 0 ? `${Math.max(fcdPct, 6)}%` : '0%' }}
                    />
                  </div>
                  <span className="bar-val">{fcdToday}</span>
                </div>
              </div>

              {totalToday === 0 && (
                <p className="monitor-empty">Belum ada data hari ini</p>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="hero-badges-section" aria-label="Keunggulan aplikasi">
        <div className="hero-badges">
          <div className="trust-badge">
            <span className="badge-value">Offline-First</span>
            <span className="badge-label">Berjalan tanpa internet</span>
          </div>
          <div className="trust-badge">
            <span className="badge-value">2 Tim Shift</span>
            <span className="badge-label">Red &amp; White tracking</span>
          </div>
          <div className="trust-badge">
            <span className="badge-value">Real-Time</span>
            <span className="badge-label">Data tersimpan instan</span>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="hero-steps-section" aria-label="Cara kerja">
        <h2 className="steps-heading">Cara kerja</h2>
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-num">01</span>
            <span className="step-name">Input</span>
            <p className="step-desc">
              Pilih jenis runner FC atau FCD, team shift, waktu, dan status shotblast dalam
              satu form cepat.
            </p>
          </div>
          <div className="step-card">
            <span className="step-num">02</span>
            <span className="step-name">Simpan</span>
            <p className="step-desc">
              Data tersimpan langsung di perangkat Anda — tetap bisa diakses kapan saja
              tanpa koneksi internet.
            </p>
          </div>
          <div className="step-card">
            <span className="step-num">03</span>
            <span className="step-name">Pantau</span>
            <p className="step-desc">
              Dashboard grafik dan riwayat lengkap tersedia setiap saat untuk supervisor dan
              operator.
            </p>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA band ── */}
      <section className="hero-cta-band">
        <div className="cta-band-inner">
          <h2 className="cta-band-title">Siap mencatat penuangan hari ini?</h2>
          <button className="hero-cta-btn" onClick={onEnter}>
            Mulai Sekarang <IconArrow />
          </button>
        </div>
      </section>

    </div>
  )
}
