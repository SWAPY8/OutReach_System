import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  QrCode,
  Shield,
  ArrowRight,
  Sun,
  Moon,
  X,
  ExternalLink,
  Download,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export const HomePage = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  // Shop details from real backend
  const [shop, setShop] = useState({
    name: 'Dhankranti Share Market Classes',
    tagline: 'Share Market & Trading Education',
    qr_token: 'dhankranti',
  });
  const [loadingShop, setLoadingShop] = useState(true);

  // Modal & Fullscreen state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  const qrCanvasRef = useRef(null);
  const fullscreenCanvasRef = useRef(null);

  // Fetch real Dhankranti shop from backend
  useEffect(() => {
    let isMounted = true;
    const fetchShopInfo = async () => {
      try {
        setLoadingShop(true);
        const res = await api.get('/api/public/review/dhankranti');
        if (isMounted && res.data && res.data.shop) {
          setShop(res.data.shop);
        }
      } catch (err) {
        console.warn('Could not load shop from API, using default Dhankranti config:', err);
      } finally {
        if (isMounted) setLoadingShop(false);
      }
    };

    fetchShopInfo();
    return () => {
      isMounted = false;
    };
  }, []);

  // Track window resizing for responsive QR dimensions
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ESC key closes modal or exits fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullScreen) {
          setIsFullScreen(false);
        } else if (qrModalOpen) {
          setQrModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [qrModalOpen, isFullScreen]);

  // Construct dynamic review URL based on current origin and real qr_token
  const qrToken = shop.qr_token || 'dhankranti';
  const qrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/r/${qrToken}`
    : `/r/${qrToken}`;

  // Download QR code canvas as image
  const handleDownloadQr = () => {
    const activeRef = isFullScreen ? fullscreenCanvasRef : qrCanvasRef;
    if (!activeRef.current) return;
    const canvas = activeRef.current.querySelector('canvas');
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'dhankranti-review-qr.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Copy review link to clipboard
  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(qrUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  // Open review page in new tab
  const handleOpenReviewPage = () => {
    window.open(qrUrl, '_blank', 'noopener,noreferrer');
  };

  // Determine responsive QR dimensions
  const getQrSize = (fullscreen = false) => {
    if (fullscreen) {
      if (windowWidth < 480) return 260;
      if (windowWidth < 768) return 320;
      return 380;
    }
    if (windowWidth < 400) return 230;
    if (windowWidth < 500) return 250;
    return 280;
  };

  return (
    <div className="station-wrapper">
      {/* Subtle Financial & Educational Background */}
      <div className="station-bg-decor" aria-hidden="true">
        <div className="station-bg-grid" />
        <div className="station-glow-top-left" />
        <div className="station-glow-top-right" />

        {/* Faint Growth Market Trend Line SVG */}
        <svg
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '0',
            width: '100%',
            height: '240px',
            opacity: isDark ? 0.08 : 0.06,
            pointerEvents: 'none',
          }}
          viewBox="0 0 1200 240"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="trendGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#059669" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path
            d="M0,190 Q220,170 380,140 T720,110 T1000,50 T1200,20"
            stroke="url(#trendGradient)"
            strokeWidth="3.5"
            strokeDasharray="6 4"
            fill="none"
          />
          <path
            d="M0,205 Q240,190 420,165 T760,135 T1040,80 T1200,45"
            stroke="url(#trendGradient)"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      {/* Top-Right Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="station-theme-toggle"
        aria-label="Toggle theme"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        id="theme-toggle-btn"
      >
        {isDark ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} color="#1e3a8a" />}
      </button>

      {/* Main Centered Station View */}
      <main className="station-container">
        {/* Brand Header */}
        <header className="station-brand-section">
          <div className="station-logo-badge">
            <img
              src={logoImg}
              alt="Dhankranti Share Market Classes Logo"
              className="station-logo-img"
            />
          </div>
          <h1 className="station-title">
            {shop.name || 'Dhankranti Share Market Classes'}
          </h1>
          <p className="station-subtitle">
            Share your learning experience
          </p>
        </header>

        {/* Main Dominant Action Card: Show Review QR */}
        <section
          className="station-main-card"
          onClick={() => setQrModalOpen(true)}
          style={{ cursor: 'pointer' }}
          role="region"
          aria-label="Student Review QR Section"
        >
          <div className="station-qr-icon-wrap">
            <QrCode size={32} />
          </div>

          <h2 className="station-card-headline">Show Review QR</h2>
          <p className="station-card-desc">
            Let customers scan and share their experience
          </p>

          <button
            type="button"
            className="btn-station-show-qr"
            onClick={(e) => {
              e.stopPropagation();
              setQrModalOpen(true);
            }}
            id="show-review-qr-btn"
            aria-haspopup="dialog"
          >
            <QrCode size={20} />
            <span>Show Review QR</span>
          </button>
        </section>

        {/* Secondary Action: Admin Portal */}
        <nav aria-label="Staff Navigation">
          <Link
            to={isAuthenticated ? '/admin/dashboard' : '/admin/login'}
            className="station-admin-link"
            id="station-admin-portal-link"
          >
            <Shield size={16} />
            <span>Admin Portal</span>
            <ArrowRight size={14} />
          </Link>
        </nav>
      </main>

      {/* QR MODAL (Standard View) */}
      {qrModalOpen && !isFullScreen && (
        <div
          className="modal-overlay"
          onClick={() => setQrModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
        >
          <div
            className="station-modal-card"
            onClick={(e) => e.stopPropagation()}
            id="station-qr-dialog"
          >
            {/* Modal Header */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}
            >
              <div style={{ textAlign: 'left', paddingRight: '8px' }}>
                <h3
                  id="qr-modal-title"
                  style={{
                    fontSize: '17px',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    lineHeight: 1.3,
                  }}
                >
                  Dhankranti Share Market Classes
                </h3>
                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '2px',
                  }}
                >
                  <Sparkles size={13} />
                  Scan to share your learning experience
                </span>
              </div>

              {/* Action buttons (Fullscreen & Close) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setIsFullScreen(true)}
                  className="admin-modal-close-btn"
                  title="Expand to Fullscreen Kiosk"
                  aria-label="Expand to full screen"
                  id="expand-fullscreen-btn"
                >
                  <Maximize2 size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="admin-modal-close-btn"
                  title="Close"
                  aria-label="Close QR"
                  id="close-qr-modal-btn"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Large Crisp High-Contrast QR Code */}
            <div
              ref={qrCanvasRef}
              className="station-qr-box"
              title="Scan with your phone camera"
            >
              <QRCodeCanvas
                value={qrUrl}
                size={getQrSize(false)}
                level="H"
                includeMargin={true}
              />
            </div>

            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-main)',
                fontWeight: 600,
                marginBottom: '10px',
              }}
            >
              Open your phone camera and scan the QR code.
            </p>

            {/* Clickable URL box with copy feedback */}
            <div
              className="station-url-pill"
              onClick={handleCopyLink}
              title="Click to copy full review URL"
            >
              {copiedLink ? (
                <>
                  <Check size={14} color="#059669" />
                  <span style={{ color: '#059669' }}>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>{qrUrl}</span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              <button
                type="button"
                onClick={handleOpenReviewPage}
                className="btn-dhankranti-primary"
                style={{
                  height: '42px',
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                id="modal-open-review-btn"
              >
                <ExternalLink size={15} />
                <span>Open Review Page</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQr}
                className="btn-dhankranti-outline"
                style={{
                  height: '42px',
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                id="modal-download-qr-btn"
              >
                <Download size={15} />
                <span>Download QR</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullScreen(true)}
                className="btn-dhankranti-ghost"
                style={{
                  height: '42px',
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                id="modal-fullscreen-toggle-btn"
              >
                <Maximize2 size={15} />
                <span>Full Screen</span>
              </button>
            </div>

            {/* Bottom Close Button */}
            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '6px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* FULLSCREEN KIOSK MODE (For Counter Tablet / Laptop Display) */}
      {isFullScreen && (
        <div
          className="station-fullscreen-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen QR Kiosk"
        >
          {/* Top Bar with Exit button */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <button
              type="button"
              onClick={() => setIsFullScreen(false)}
              className="btn-dhankranti-outline"
              style={{
                height: '40px',
                padding: '0 16px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '10px',
              }}
              id="exit-fullscreen-top-btn"
            >
              <Minimize2 size={16} />
              <span>Exit Fullscreen</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFullScreen(false);
                setQrModalOpen(false);
              }}
              className="admin-modal-close-btn"
              aria-label="Close"
              title="Close completely"
            >
              <X size={24} />
            </button>
          </div>

          {/* Centered Kiosk Display */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '640px',
              width: '100%',
              margin: 'auto',
            }}
          >
            <div className="station-logo-badge" style={{ marginBottom: '14px' }}>
              <img
                src={logoImg}
                alt="Dhankranti Logo"
                className="station-logo-img"
                style={{ maxHeight: '72px' }}
              />
            </div>

            <h2
              style={{
                fontSize: '30px',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                marginBottom: '4px',
              }}
            >
              Dhankranti Share Market Classes
            </h2>

            <p
              style={{
                fontSize: '17px',
                fontWeight: 600,
                color: 'var(--accent)',
                marginBottom: '16px',
              }}
            >
              Scan to share your learning experience
            </p>

            {/* Giant Crisp High-Contrast QR Code */}
            <div
              ref={fullscreenCanvasRef}
              className="station-qr-box"
              style={{
                padding: '24px',
                borderRadius: '24px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                margin: '10px 0 20px',
              }}
            >
              <QRCodeCanvas
                value={qrUrl}
                size={getQrSize(true)}
                level="H"
                includeMargin={true}
              />
            </div>

            <p
              style={{
                fontSize: '16px',
                color: 'var(--text-main)',
                fontWeight: 600,
                marginBottom: '24px',
              }}
            >
              Open your phone camera and point at the QR code.
            </p>

            {/* Exit Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsFullScreen(false)}
              className="btn-station-show-qr"
              style={{ maxWidth: '280px', height: '48px', fontSize: '15px' }}
              id="exit-fullscreen-main-btn"
            >
              <Minimize2 size={18} />
              <span>Exit Full Screen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
