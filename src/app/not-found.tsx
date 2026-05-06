import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a08',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '24px',
      paddingTop: '80px',
    }}>
      <style>{`
        .nf-code {
          font-family: 'Playfair Display', serif;
          font-size: 120px;
          font-weight: 900;
          background: linear-gradient(135deg, #f0c850 0%, #ffd966 40%, #ffe47a 50%, #ffd966 60%, #f0c850 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s ease-in-out infinite;
          line-height: 1;
          margin-bottom: 16px;
        }
        .nf-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 800;
          color: #eae6de;
          margin-bottom: 8px;
        }
        .nf-desc {
          font-size: 14px;
          color: #5a5650;
          margin-bottom: 32px;
          max-width: 400px;
        }
        .nf-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #f0c850 0%, #ffd966 40%, #ffe47a 50%, #ffd966 60%, #f0c850 100%);
          background-size: 200% 200%;
          color: #0a0a08;
          border: none;
          padding: 14px 32px;
          border-radius: 13px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          animation: shimmer 3s ease-in-out infinite;
          box-shadow: 0 2px 12px rgba(240, 200, 80, 0.12);
          transition: all 0.25s;
          font-family: 'Inter', sans-serif;
        }
        .nf-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 28px rgba(240, 200, 80, 0.4);
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className="nf-code">404</div>
      <div className="nf-title">Coupon Not Found</div>
      <p className="nf-desc">This page doesn&apos;t exist or the coupon has been removed. Maybe try a different one?</p>
      <Link href="/" className="nf-btn">
        <span style={{ fontSize: 12 }}>←</span> Back to TradeOff
      </Link>
    </div>
  );
}
