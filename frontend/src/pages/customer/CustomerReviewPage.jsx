import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/client';
import { useTheme } from '../../context/ThemeContext';
import { getCategoryIcon } from '../../utils/iconMap';
import {
  ChevronLeft,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Check,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const CustomerReviewPage = () => {
  const { qrToken } = useParams();
  const { isDark, toggleTheme } = useTheme();

  // Shop & Category Data
  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Flow State: 1 = Combined Brand & Categories, 2 = Review List, 3 = Selected Review
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  // Copy & Redirect States
  const [copyState, setCopyState] = useState('idle'); // 'idle' | 'copied' | 'opening'
  const [copyFailed, setCopyFailed] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

  // Anonymous customer session token
  const [sessionToken, setSessionToken] = useState(null);

  // 1. Fetch shop and active reviews
  useEffect(() => {
    const fetchShopData = async () => {
      setLoading(true);
      setError(null);
      try {
        const tokenToUse = qrToken || 'dhankranti';
        const res = await api.get(`/api/public/review/${tokenToUse}`);
        setShop(res.data.shop);
        setCategories(res.data.categories || []);

        // Initialize anonymous customer session
        initSession(tokenToUse);
      } catch (err) {
        console.error('Failed to load Dhankranti reviews:', err);
        if (err.response && err.response.data && err.response.data.detail) {
          setError(typeof err.response.data.detail === 'string' ? err.response.data.detail : 'Review link is inactive.');
        } else {
          setError('Sorry, this review link is no longer active. Please ask the Dhankranti staff for assistance.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [qrToken]);

  // Initialize or fetch customer review session
  const initSession = async (token) => {
    try {
      const storageKey = `dhankranti_session_${token}`;
      let activeSession = localStorage.getItem(storageKey);
      if (!activeSession) {
        const res = await api.post('/api/public/sessions', { qr_token: token });
        activeSession = res.data.session_token;
        localStorage.setItem(storageKey, activeSession);
      }
      setSessionToken(activeSession);
    } catch (err) {
      console.warn('Session initialization notice:', err);
    }
  };

  // Screen 1 -> Screen 2: Customer taps category
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setCurrentStep(2); // Review selection list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Screen 2 -> Screen 3: Customer taps review card
  const handleSelectReview = async (review) => {
    setSelectedReview(review);
    setCurrentStep(3); // Selected Review view
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Record selection in backend session
    if (sessionToken) {
      try {
        await api.post(`/api/public/sessions/${sessionToken}/select`, {
          review_id: review.id,
        });
      } catch (err) {
        console.warn('Failed to record review selection:', err);
      }
    }
  };

  // Copy helper
  const copyTextToClipboard = async (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('Clipboard API failed, trying fallback:', err);
      }
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    } catch (fallbackErr) {
      console.warn('Fallback copy failed:', fallbackErr);
      return false;
    }
  };

  // PRIMARY ACTION: "Copy & Open Google Review"
  const handleCopyAndOpenGoogle = async () => {
    if (!selectedReview || !shop?.review_url) return;

    setCopyFailed(false);
    setPopupBlocked(false);

    // 1. Copy selected review using Clipboard API
    const copied = await copyTextToClipboard(selectedReview.review_text);

    if (copied) {
      setCopyState('copied');

      // 2. Record copied_at in backend
      if (sessionToken) {
        try {
          await api.post(`/api/public/sessions/${sessionToken}/copy`);
        } catch (err) {
          console.warn('Failed to record copy event in session:', err);
        }
      }

      // 3. Record redirected_at before opening URL
      if (sessionToken) {
        try {
          await api.post(`/api/public/sessions/${sessionToken}/redirect`);
        } catch (err) {
          console.warn('Failed to record redirect event in session:', err);
        }
      }

      // 4. Open Google review URL in a new tab after brief visual confirmation
      setTimeout(() => {
        try {
          const win = window.open(shop.review_url, '_blank', 'noopener,noreferrer');
          if (!win || win.closed || typeof win.closed === 'undefined') {
            setPopupBlocked(true);
          }
        } catch (openErr) {
          setPopupBlocked(true);
        }
      }, 350);
    } else {
      setCopyFailed(true);
    }
  };

  // Manual redirect handler if popup was blocked
  const handleManualOpenGoogle = async () => {
    if (!shop?.review_url) return;
    if (sessionToken) {
      api.post(`/api/public/sessions/${sessionToken}/redirect`).catch(() => {});
    }
    window.open(shop.review_url, '_blank', 'noopener,noreferrer');
  };

  // Back Navigation Helper
  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2); // Back to review list for same category
      setCopyState('idle');
      setCopyFailed(false);
      setPopupBlocked(false);
    } else if (currentStep === 2) {
      setCurrentStep(1); // Back to categories
      setSelectedCategory(null);
    }
  };

  // -------------------------------------------------------------
  // Loading & Error States
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="customer-mobile-wrapper">
        <div className="customer-phone-frame" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '14.5px' }}>
            Loading reviews...
          </p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="customer-mobile-wrapper">
        <div className="customer-phone-frame" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <AlertCircle size={28} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Review Page Unavailable
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
            {error || 'Sorry, this review link is no longer active.'}
          </p>
          <a
            href="/"
            className="btn-dhankranti-primary"
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 1: Combined Brand Header + Category Cards
  // -------------------------------------------------------------
  if (currentStep === 1) {
    return (
      <div className="customer-mobile-wrapper">
        <div className="customer-phone-frame">
          {/* Header with Official Dhankranti Logo & Prompt */}
          <div className="dhankranti-customer-header" style={{ position: 'relative' }}>
            {/* Top theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '10px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="var(--primary)" />}
            </button>

            <img
              src={logoImg}
              alt={shop.name}
              className="dhankranti-brand-logo"
            />
            <h1 className="dhankranti-brand-title">{shop.name}</h1>
            <p className="dhankranti-brand-tagline">{shop.tagline || 'Great Service. Better Experience.'}</p>

            <div className="dhankranti-experience-prompt">
              <h2 className="prompt-main-question">How was your experience?</h2>
              <p className="prompt-sub-instruction">Choose what you'd like to highlight</p>
            </div>
          </div>

          {/* Category Cards (2-Column Grid) */}
          <div className="dhankranti-categories-container">
            <div className="dhankranti-categories-grid">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  id={`cat-card-${cat.id}`}
                  onClick={() => handleSelectCategory(cat)}
                  className="dhankranti-cat-card"
                >
                  <div className="dhankranti-cat-icon-wrap">
                    {getCategoryIcon(cat.icon || cat.name, 22)}
                  </div>
                  <span className="dhankranti-cat-label">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clean footer note */}
          <div className="dhankranti-customer-footer-note">
            Choose a review that best matches your experience.
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 2: Review Templates Selection
  // -------------------------------------------------------------
  if (currentStep === 2) {
    const reviews = selectedCategory?.reviews || [];

    return (
      <div className="customer-mobile-wrapper">
        <div className="customer-phone-frame">
          {/* Top Bar with Back action & Theme Toggle */}
          <div className="mobile-nav-bar">
            <button onClick={handleBack} className="mobile-back-action-btn" id="review-list-back-btn">
              <ChevronLeft size={20} />
              <span>Back</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={toggleTheme}
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDark ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="var(--primary)" />}
              </button>
              <img
                src={logoImg}
                alt="Logo"
                className="mobile-brand-logo-small"
              />
            </div>
          </div>

          <div className="review-selection-content">
            {/* Category Banner */}
            <div className="category-selection-header-badge">
              <div className="category-badge-icon-box">
                {getCategoryIcon(selectedCategory?.icon || selectedCategory?.name, 22)}
              </div>
              <div>
                <h2 className="category-badge-title">{selectedCategory?.name}</h2>
                <p className="category-badge-desc">
                  {selectedCategory?.description || 'Select the statement that best reflects your experience.'}
                </p>
              </div>
            </div>

            <p className="review-list-instruction">
              Choose a review that best matches your experience:
            </p>

            {/* List of review cards */}
            <div className="reviews-selection-list">
              {reviews.map((rev) => {
                const isSelected = selectedReview?.id === rev.id;
                return (
                  <div
                    key={rev.id}
                    id={`review-item-${rev.id}`}
                    onClick={() => handleSelectReview(rev)}
                    className={`dhankranti-review-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="review-selection-indicator">
                      {isSelected ? <Check size={14} strokeWidth={3} /> : null}
                    </div>
                    <p className="review-card-text">{rev.review_text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 3: Selected Review & "Copy & Open Google Review"
  // -------------------------------------------------------------
  return (
    <div className="customer-mobile-wrapper">
      <div className="customer-phone-frame">
        {/* Top Bar with "Choose another review" */}
        <div className="mobile-nav-bar">
          <button onClick={handleBack} className="mobile-back-action-btn" id="choose-another-top-btn">
            <ChevronLeft size={20} />
            <span>Choose another review</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isDark ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="var(--primary)" />}
            </button>
            <img
              src={logoImg}
              alt="Logo"
              className="mobile-brand-logo-small"
            />
          </div>
        </div>

        <div className="selected-review-view-container">
          <img
            src={logoImg}
            alt="Logo"
            className="dhankranti-selected-brand-badge"
          />

          <div className="review-confirmed-tag">
            <CheckCircle2 size={16} />
            <span>Review Selected</span>
          </div>

          <h2 className="review-confirmed-title">Here's the review you've chosen:</h2>
          <p className="review-confirmed-sub">
            Click below to copy and open Google. Then paste and submit your review!
          </p>

          {/* Highlighted Review Card */}
          <div className="highlighted-review-box" id="selected-review-content-card">
            {selectedReview?.review_text}
          </div>

          {/* Fallback if automatic clipboard access was blocked */}
          {copyFailed && (
            <div style={{ width: '100%', marginBottom: '16px', textAlign: 'left' }}>
              <p style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 600, marginBottom: '6px' }}>
                Copy automatically failed. Please copy the text below:
              </p>
              <textarea
                readOnly
                value={selectedReview?.review_text}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid var(--glass-border)',
                  fontSize: '13.5px',
                  fontFamily: 'inherit',
                  backgroundColor: 'var(--glass-bg)',
                  color: 'var(--text-main)',
                }}
                onFocus={(e) => e.target.select()}
              />
            </div>
          )}

          {/* Fallback if popup blocker intercepted */}
          {popupBlocked && (
            <div
              style={{
                width: '100%',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '16px',
                textAlign: 'left',
                fontSize: '13px',
                color: '#f59e0b',
              }}
            >
              Google Review page could not be opened automatically. Use the button below:
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="dhankranti-action-buttons">
            <button
              id="copy-open-google-btn"
              onClick={handleCopyAndOpenGoogle}
              className={copyState === 'copied' ? 'btn-dhankranti-success' : 'btn-dhankranti-primary'}
            >
              {copyState === 'copied' ? (
                <>
                  <Check size={20} />
                  <span>✓ Review Copied — Opening Google...</span>
                </>
              ) : (
                <>
                  <Copy size={19} />
                  <span>Copy & Open Google Review</span>
                </>
              )}
            </button>

            {/* Direct Open Google fallback if popup was blocked */}
            {popupBlocked && (
              <button
                id="open-google-direct-btn"
                onClick={handleManualOpenGoogle}
                className="btn-dhankranti-primary"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <ExternalLink size={18} />
                <span>Open Google Review</span>
              </button>
            )}

            {/* Choose another review secondary button */}
            <button
              id="choose-another-review-btn"
              onClick={handleBack}
              className="btn-dhankranti-secondary"
            >
              <ChevronLeft size={18} />
              <span>Choose Another Review</span>
            </button>
          </div>

          <p className="action-guidance-text">
            After Google opens, simply paste your copied review into the Google review box and click submit.
          </p>
        </div>
      </div>
    </div>
  );
};
