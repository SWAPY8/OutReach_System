import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Shield, ArrowRight, GraduationCap, CheckCircle2, Copy, Sparkles, TrendingUp } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const HomePage = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '44px 32px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Dhankranti Official Logo */}
        <div style={{ marginBottom: '20px' }}>
          <img
            src={logoImg}
            alt="Dhankranti Share Market Classes"
            style={{
              maxHeight: '76px',
              maxWidth: '220px',
              objectFit: 'contain',
              display: 'inline-block',
            }}
          />
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Dhankranti Share Market Classes
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 28px' }}>
          Student Feedback & Google Review Assistance System. Quick QR-assisted workflow: Scan &rarr; Choose Experience Theme &rarr; Copy Prewritten Review &rarr; Post on Google.
        </p>

        {/* Action cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {/* Customer Experience Flow */}
          <Link
            to="/r/dhankranti"
            id="demo-customer-link"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 20px',
              backgroundColor: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '16px',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#1e3a8a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              <QrCode size={24} />
            </div>
            <strong style={{ fontSize: '16px', color: '#1e3a8a', marginBottom: '4px' }}>
              Student Review Flow
            </strong>
            <span style={{ fontSize: '13px', color: '#3b82f6', marginBottom: '12px' }}>
              Open /r/dhankranti QR Experience
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Try Student Flow <ArrowRight size={14} />
            </span>
          </Link>

          {/* Admin Dashboard */}
          <Link
            to="/admin/login"
            id="demo-admin-link"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 20px',
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              <Shield size={24} />
            </div>
            <strong style={{ fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>
              Admin Portal
            </strong>
            <span style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
              Manage Categories, 80 Reviews & QR
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Admin Dashboard <ArrowRight size={14} />
            </span>
          </Link>
        </div>

        {/* Demo credentials note */}
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: '#f1f5f9',
            borderRadius: '10px',
            fontSize: '12px',
            color: '#475569',
            display: 'inline-block',
          }}
        >
          Dev Credentials &mdash; Email: <strong>admin@example.com</strong> | Password: <strong>Admin@123</strong>
        </div>
      </div>
    </div>
  );
};
