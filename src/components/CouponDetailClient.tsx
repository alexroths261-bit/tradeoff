'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

interface Coupon {
  id: number;
  brand: string;
  cat: string;
  desc: string;
  price: number;
  original: number;
  expiry: string;
  rating: number;
  reviews: number;
  sellerName: string;
  sellerId: string;
  wishlistCount: number;
  createdAt: string;
}

const CAT_LABELS: Record<string, string> = {
  food: 'Food & Dining',
  travel: 'Travel',
  fashion: 'Fashion',
  grocery: 'Grocery',
  electronics: 'Electronics',
};

const CAT_ICONS: Record<string, string> = {
  food: 'fa-solid fa-burger',
  travel: 'fa-solid fa-plane-departure',
  fashion: 'fa-solid fa-bag-shopping',
  grocery: 'fa-solid fa-basket-shopping',
  electronics: 'fa-solid fa-box-open',
};

function savePct(p: number, o: number) { return Math.round((1 - p / o) * 100); }
function fmtD(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
function getInitials(name: string) { return name.split(' ').map(w => w[0]).join(''); }

function timeLeft(expiry: string) {
  const diff = new Date(expiry).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export default function CouponDetailClient({ coupon }: { coupon: Coupon }) {
  const [countdown, setCountdown] = useState(timeLeft(coupon.expiry));
  const [payState, setPayState] = useState<'idle' | 'processing' | 'done'>('idle');
  const [revealedCode, setRevealedCode] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [wishlisted, setWishlisted] = useState(false);

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown(timeLeft(coupon.expiry));
    }, 1000);
    return () => clearInterval(iv);
  }, [coupon.expiry]);

  function simulatePayment() {
    setPayState('processing');
    setTimeout(() => {
      const code = 'TROF' + coupon.id + Math.random().toString(36).substring(2, 6).toUpperCase();
      setRevealedCode(code);
      setPayState('done');
      showToast('Payment successful! Code revealed.', 'success');
    }, 2000);
  }

  function copyCode() {
    navigator.clipboard.writeText(revealedCode);
    showToast('Code copied!', 'success');
  }

  function toggleWishlist() {
    setWishlisted(!wishlisted);
    showToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'success');
  }

  const isExpired = countdown === 'Expired';

  return (
    <>
      <style>{`
        .detail-wrap{min-height:100vh;background:var(--bg,#0a0a08);padding-top:60px;position:relative;z-index:1}
        .detail-inner{max-width:900px;margin:0 auto;padding:36px 24px 80px}
        .detail-back{display:inline-flex;align-items:center;gap:6px;color:var(--tm,#908a7e);font-size:13px;font-weight:500;text-decoration:none;margin-bottom:28px;transition:.2s;cursor:pointer;background:none;border:none;font-family:'Inter',sans-serif}
        .detail-back:hover{color:var(--gold,#f0c850)}
        .detail-card{background:var(--card,#121212);border:1px solid var(--b,#1c1c19);border-radius:20px;overflow:hidden}
        .detail-top{padding:32px;display:flex;gap:24px;align-items:flex-start}
        .detail-logo{width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;flex-shrink:0;box-shadow:0 4px 16px rgba(0,0,0,.3)}
        .detail-logo.food{background:linear-gradient(135deg,#ff4d6a,#d93050)}
        .detail-logo.travel{background:linear-gradient(135deg,#5a9be6,#3a78c0)}
        .detail-logo.fashion{background:linear-gradient(135deg,#d07ae6,#a84dc0)}
        .detail-logo.grocery{background:linear-gradient(135deg,#44e07a,#2cb85e)}
        .detail-logo.electronics{background:linear-gradient(135deg,#ffb020,#d99510)}
        .detail-info{flex:1}
        .detail-info .cat-tag{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--gold,#f0c850);background:rgba(240,200,80,.12);padding:3px 10px;border-radius:100px;display:inline-block;margin-bottom:8px}
        .detail-info h1{font-family:'Playfair Display',serif;font-size:32px;font-weight:800;color:var(--t,#eae6de);letter-spacing:-.5px;margin-bottom:6px}
        .detail-info .desc{font-size:14px;color:var(--tm,#908a7e);line-height:1.7}
        .detail-actions-row{display:flex;gap:10px;margin-top:16px}
        .wishlist-btn{width:42px;height:42px;border-radius:10px;border:1px solid var(--b,#1c1c19);background:rgba(255,255,255,.02);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s;font-size:16px;color:var(--tm,#908a7e)}
        .wishlist-btn:hover{border-color:var(--goldD,#c9a832);color:var(--gold,#f0c850)}
        .wishlist-btn.active{background:rgba(240,200,80,.15);border-color:var(--goldD,#c9a832);color:var(--gold,#f0c850)}
        .detail-divider{border-top:1px solid var(--b,#1c1c19)}
        .detail-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:0}
        .detail-stat{text-align:center;padding:20px 12px;border-right:1px solid var(--b,#1c1c19)}
        .detail-stat:last-child{border-right:none}
        .detail-stat .val{font-size:20px;font-weight:800;color:var(--t,#eae6de)}
        .detail-stat .val.gold{color:var(--gold,#f0c850)}
        .detail-stat .val.green{color:var(--grn,#44e07a)}
        .detail-stat .val.red{color:var(--red,#ff4d6a)}
        .detail-stat .lbl{font-size:9px;color:var(--td,#5a5650);text-transform:uppercase;letter-spacing:.8px;margin-top:3px;font-weight:600}
        .detail-seller{padding:24px 32px;display:flex;align-items:center;gap:14px;border-top:1px solid var(--b,#1c1c19)}
        .seller-avatar{width:40px;height:40px;border-radius:50%;background:var(--bl,#28281f);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--tm,#908a7e);border:1px solid var(--b,#1c1c19)}
        .seller-info{flex:1}
        .seller-name{font-size:14px;font-weight:700;color:var(--t,#eae6de)}
        .seller-meta{font-size:11px;color:var(--td,#5a5650);margin-top:2px;display:flex;align-items:center;gap:8px}
        .seller-meta .stars{color:var(--gold,#f0c850)}
        .seller-badge{font-size:10px;font-weight:600;background:rgba(240,200,80,.12);color:var(--gold,#f0c850);padding:3px 10px;border-radius:100px;border:1px solid rgba(240,200,80,.2)}
        .detail-code-section{padding:24px 32px;border-top:1px solid var(--b,#1c1c19)}
        .detail-code-section .label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--td,#5a5650);margin-bottom:10px}
        .code-masked{background:repeating-linear-gradient(135deg,#1a1a18 0px,#1a1a18 8px,#1e1e1c 8px,#1e1e1c 16px);border:1px solid var(--b,#1c1c19);border-radius:10px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between}
        .code-masked .masked-text{font-size:16px;letter-spacing:4px;color:var(--td,#5a5650);filter:blur(3px);user-select:none;font-family:'Courier New',monospace;font-weight:700}
        .code-masked .lock-text{font-size:11px;color:var(--td,#5a5650);display:flex;align-items:center;gap:5px}
        .code-revealed{background:linear-gradient(135deg,rgba(68,224,122,.07),rgba(68,224,122,.02));border:1px dashed rgba(68,224,122,.3);border-radius:10px;padding:20px;text-align:center;display:none}
        .code-revealed.show{display:block;animation:fiu .4s ease}
        .code-revealed .label{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--grn,#44e07a);display:block;margin-bottom:8px;font-weight:700}
        .code-revealed code{font-size:26px;font-weight:800;color:var(--t,#eae6de);letter-spacing:5px;font-family:'Courier New',monospace}
        .code-revealed .copy-btn{margin-top:12px;background:rgba(68,224,122,.1);border:1px solid rgba(68,224,122,.2);color:var(--grn,#44e07a);padding:8px 20px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:.2s}
        .code-revealed .copy-btn:hover{background:rgba(68,224,122,.2)}
        .detail-buy{padding:24px 32px;border-top:1px solid var(--b,#1c1c19);display:flex;align-items:center;gap:16px}
        .buy-price-block{flex:1}
        .buy-price{font-size:28px;font-weight:800;color:var(--t,#eae6de)}
        .buy-price-old{font-size:14px;color:var(--td,#5a5650);text-decoration:line-through;margin-left:8px}
        .buy-save{font-size:12px;color:var(--grn,#44e07a);font-weight:600;margin-top:2px}
        .buy-btn{background:linear-gradient(135deg,#f0c850 0%,#ffd966 40%,#ffe47a 50%,#ffd966 60%,#f0c850 100%);background-size:200% 200%;animation:shimmer 3s ease-in-out infinite;color:#0a0a08;border:none;padding:16px 40px;border-radius:12px;font-size:15px;font-weight:800;cursor:pointer;transition:all .25s;font-family:'Inter',sans-serif;box-shadow:0 2px 12px rgba(240,200,80,.12);white-space:nowrap}
        .buy-btn:hover{transform:translateY(-2px);box-shadow:0 6px 28px rgba(240,200,80,.4)}
        .buy-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:none}
        .buy-btn.done{background:linear-gradient(135deg,#44e07a,#2cb85e);animation:none}
        .timer-badge{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--td,#5a5650);padding:10px 0}
        .timer-badge i{color:var(--goldD,#c9a832);font-size:13px}
        .timer-badge .time{color:var(--gold,#f0c850);font-weight:700;font-variant-numeric:tabular-nums}
        .timer-badge.expired .time{color:var(--red,#ff4d6a)}
        .toast-el{position:fixed;bottom:24px;right:24px;z-index:300;background:#151513;border:1px solid var(--bl,#28281f);border-radius:11px;padding:11px 16px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500;transform:translateY(100px);opacity:0;transition:all .3s cubic-bezier(.22,1,.36,1);box-shadow:0 8px 24px rgba(0,0,0,.5)}
        .toast-el.show{transform:translateY(0);opacity:1}
        .toast-el.success{border-color:rgba(68,224,122,.3)}.toast-el.success i{color:var(--grn,#44e07a)}
        .toast-el.error{border-color:rgba(255,77,106,.3)}.toast-el.error i{color:var(--red,#ff4d6a)}
        @keyframes shimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes fiu{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:680px){
          .detail-top{flex-direction:column;align-items:center;text-align:center;padding:24px}
          .detail-actions-row{justify-content:center}
          .detail-stats{grid-template-columns:repeat(2,1fr)}
          .detail-stat:nth-child(2){border-right:none}
          .detail-seller{flex-direction:column;text-align:center}
          .detail-buy{flex-direction:column;text-align:center}
          .buy-price-block{display:flex;flex-direction:column;align-items:center}
        }
      `}</style>

      <div className="detail-wrap">
        <div className="detail-inner">
          <Link href="/browse" className="detail-back">
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> Back to Browse
          </Link>

          <div className="detail-card">
            {/* Top */}
            <div className="detail-top">
              <div className={`detail-logo ${coupon.cat}`}>
                <i className={CAT_ICONS[coupon.cat] || 'fa-solid fa-tag'} />
              </div>
              <div className="detail-info">
                <div className="cat-tag">{CAT_LABELS[coupon.cat] || coupon.cat}</div>
                <h1>{coupon.brand}</h1>
                <p className="desc">{coupon.desc}</p>
                <div className="detail-actions-row">
                  <button
                    className={`wishlist-btn${wishlisted ? ' active' : ''}`}
                    onClick={toggleWishlist}
                  >
                    <i className={wishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
                  </button>
                  <span style={{ fontSize: 11, color: 'var(--td,#5a5650)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="fa-regular fa-heart" style={{ fontSize: 10 }} /> {coupon.wishlistCount + (wishlisted ? 1 : 0)} watching
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="detail-divider" />
            <div className="detail-stats">
              <div className="detail-stat">
                <div className="val gold">₹{coupon.price}</div>
                <div className="lbl">Listing Price</div>
              </div>
              <div className="detail-stat">
                <div className="val">₹{coupon.original}</div>
                <div className="lbl">Original Value</div>
              </div>
              <div className="detail-stat">
                <div className="val green">{savePct(coupon.price, coupon.original)}%</div>
                <div className="lbl">You Save</div>
              </div>
              <div className="detail-stat">
                <div className="val green">₹{coupon.original - coupon.price}</div>
                <div className="lbl">Cash Saved</div>
              </div>
            </div>

            {/* Timer */}
            <div className="detail-divider" />
            <div style={{ padding: '16px 32px' }}>
              <div className={`timer-badge${isExpired ? ' expired' : ''}`}>
                <i className="fa-solid fa-clock" />
                {isExpired ? 'This coupon has' : 'Expires in'} <span className="time">{countdown}</span>
              </div>
            </div>

            {/* Seller */}
            <div className="detail-seller">
              <div className="seller-avatar">{getInitials(coupon.sellerName)}</div>
              <div className="seller-info">
                <div className="seller-name">{coupon.sellerName}</div>
                <div className="seller-meta">
                  <span className="stars"><i className="fa-solid fa-star" style={{ fontSize: 10 }} /> {coupon.rating}</span>
                  <span>({coupon.reviews} reviews)</span>
                </div>
              </div>
              <div className="seller-badge"><i className="fa-solid fa-circle-check" style={{ fontSize: 9, marginRight: 3 }} /> Verified Seller</div>
            </div>

            {/* Code */}
            <div className="detail-code-section">
              <div className="label">Coupon Code</div>
              <div className="code-masked">
                <span className="masked-text">XXXX-XXXX-XXXX</span>
                <span className="lock-text"><i className="fa-solid fa-lock" style={{ fontSize: 10 }} /> Revealed after payment</span>
              </div>
              <div className={`code-revealed${revealedCode ? ' show' : ''}`}>
                <label>Your Coupon Code</label>
                <code>{revealedCode}</code>
                <br />
                <button className="copy-btn" onClick={copyCode}><i className="fa-regular fa-copy" /> Copy Code</button>
              </div>
            </div>

            {/* Buy */}
            <div className="detail-buy">
              <div className="buy-price-block">
                <span className="buy-price">₹{coupon.price}</span>
                <span className="buy-price-old">₹{coupon.original}</span>
                <div className="buy-save">You save ₹{coupon.original - coupon.price} ({savePct(coupon.price, coupon.original)}%)</div>
              </div>
              <button
                className={`buy-btn${payState === 'done' ? ' done' : ''}`}
                disabled={payState !== 'idle' || isExpired}
                onClick={simulatePayment}
              >
                {isExpired && 'Expired'}
                {payState === 'idle' && !isExpired && '⚡ Buy Now'}
                {payState === 'processing' && 'Processing...'}
                {payState === 'done' && '✓ Purchased'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast-el${toast ? ' show' : ''} ${toast?.type || ''}`}>
        <i className={toast?.type === 'success' ? 'fa-solid fa-check-circle' : 'fa-solid fa-exclamation-circle'} />
        <span>{toast?.msg}</span>
      </div>
    </>
  );
}
