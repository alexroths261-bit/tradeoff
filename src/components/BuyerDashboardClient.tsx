'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

interface Purchase {
  id: number;
  brand: string;
  cat: string;
  discount: string;
  price: number;
  original: number;
  code: string;
  purchasedAt: string;
  expiry: string;
  sellerName: string;
  used: boolean;
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

const FALLBACK_PURCHASES: Purchase[] = [
  { id: 1, brand: 'Swiggy', cat: 'food', discount: '50% OFF', price: 45, original: 150, code: 'SWIGGY50X9K2', purchasedAt: '2026-02-10', expiry: '2026-05-30', sellerName: 'Rahul K.', used: false },
  { id: 2, brand: 'Myntra', cat: 'fashion', discount: '₹500 off', price: 99, original: 500, code: 'MYNTRA500PQ7R', purchasedAt: '2026-02-12', expiry: '2026-03-10', sellerName: 'Amit M.', used: true },
  { id: 3, brand: 'Flipkart', cat: 'electronics', discount: '₹1,000 off', price: 199, original: 1000, code: 'FLIPK1KM3NW8', purchasedAt: '2026-02-15', expiry: '2026-06-30', sellerName: 'Anita G.', used: false },
  { id: 4, brand: 'Zomato', cat: 'food', discount: '₹80 off', price: 15, original: 80, code: 'ZOMATO80JL4TV', purchasedAt: '2026-02-18', expiry: '2026-05-20', sellerName: 'Karan J.', used: false },
  { id: 5, brand: 'MakeMyTrip', cat: 'travel', discount: '₹2,000 off', price: 799, original: 2000, code: 'MMT2000RK9XP', purchasedAt: '2026-01-20', expiry: '2026-01-25', sellerName: 'Rahul K.', used: true },
];

function fmtD(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function BuyerDashboardClient({ userName }: { userId: string; userName: string }) {
  const [purchases, setPurchases] = useState<Purchase[]>(FALLBACK_PURCHASES);
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    showToast('Code copied!', 'success');
  }

  function markUsed(id: number) {
    setPurchases(purchases.map(p => p.id === id ? { ...p, used: true } : p));
    showToast('Marked as used', 'success');
  }

  const now = Date.now();
  const filtered = purchases.filter(p => {
    if (filter === 'active') return !p.used && new Date(p.expiry).getTime() > now;
    if (filter === 'used') return p.used;
    if (filter === 'expired') return new Date(p.expiry).getTime() <= now;
    return true;
  });

  const totalSpent = purchases.reduce((a, p) => a + p.price, 0);
  const totalSaved = purchases.reduce((a, p) => a + (p.original - p.price), 0);
  const activeCodes = purchases.filter(p => !p.used && new Date(p.expiry).getTime() > now).length;
  const usedCodes = purchases.filter(p => p.used).length;

  return (
    <>
      <style>{`
        .bdash-wrap{min-height:100vh;background:var(--bg,#0a0a08);padding-top:60px;position:relative;z-index:1}
        .bdash-inner{max-width:1100px;margin:0 auto;padding:36px 24px 80px}
        .bdash-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:16px}
        .bdash-hdr h1{font-family:'Playfair Display',serif;font-size:30px;font-weight:800;color:var(--t,#eae6de);letter-spacing:-.4px}
        .bdash-hdr .user-badge{font-size:12px;color:var(--tm,#908a7e);display:flex;align-items:center;gap:6px}
        .bdash-hdr .user-badge .avatar{width:28px;height:28px;border-radius:50%;background:var(--bl,#28281f);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--tm,#908a7e);border:1px solid var(--b,#1c1c19)}
        .stat-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
        .stat-card{background:var(--card,#121212);border:1px solid var(--b,#1c1c19);border-radius:14px;padding:18px;transition:.2s}
        .stat-card:hover{border-color:rgba(240,200,80,.2)}
        .stat-card .sc-label{font-size:10px;color:var(--td,#5a5650);text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:6px}
        .stat-card .sc-val{font-family:'Playfair Display',serif;font-size:26px;font-weight:800;color:var(--t,#eae6de)}
        .stat-card .sc-val.gold{color:var(--gold,#f0c850)}
        .stat-card .sc-val.green{color:var(--grn,#44e07a)}
        .stat-card .sc-val.red{color:var(--red,#ff4d6a)}
        .filter-bar{display:flex;gap:6px;margin-bottom:24px}
        .fbtn{padding:8px 18px;border-radius:8px;font-size:12px;font-weight:600;border:1px solid var(--b,#1c1c19);background:var(--card,#121212);color:var(--tm,#908a7e);cursor:pointer;transition:.2s;font-family:'Inter',sans-serif}
        .fbtn:hover{border-color:var(--goldD,#c9a832);color:var(--t,#eae6de)}
        .fbtn.active{background:rgba(240,200,80,.15);border-color:var(--goldD,#c9a832);color:var(--gold,#f0c850)}
        .purchase-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
        .pcard{background:var(--card,#121212);border:1px solid var(--b,#1c1c19);border-radius:16px;overflow:hidden;transition:.2s}
        .pcard:hover{border-color:rgba(240,200,80,.2)}
        .pcard.used{opacity:.6}
        .pcard-top{padding:18px;display:flex;align-items:center;gap:12px}
        .pcard-logo{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.3)}
        .pcard-logo.food{background:linear-gradient(135deg,#ff4d6a,#d93050)}
        .pcard-logo.travel{background:linear-gradient(135deg,#5a9be6,#3a78c0)}
        .pcard-logo.fashion{background:linear-gradient(135deg,#d07ae6,#a84dc0)}
        .pcard-logo.grocery{background:linear-gradient(135deg,#44e07a,#2cb85e)}
        .pcard-logo.electronics{background:linear-gradient(135deg,#ffb020,#d99510)}
        .pcard-brand{font-size:15px;font-weight:700;color:var(--t,#eae6de)}
        .pcard-cat{font-size:10px;color:var(--td,#5a5650);text-transform:uppercase;letter-spacing:.5px;margin-top:1px}
        .pcard-badge{margin-left:auto;font-size:10px;font-weight:700;padding:3px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:.5px}
        .pcard-badge.active{background:rgba(68,224,122,.12);color:var(--grn,#44e07a);border:1px solid rgba(68,224,122,.2)}
        .pcard-badge.used-badge{background:rgba(90,90,80,.15);color:var(--td,#5a5650);border:1px solid var(--b,#1c1c19)}
        .pcard-badge.expired{background:rgba(255,77,106,.12);color:var(--red,#ff4d6a);border:1px solid rgba(255,77,106,.2)}
        .pcard-code{margin:0 18px;padding:14px 16px;background:linear-gradient(135deg,rgba(68,224,122,.06),rgba(68,224,122,.02));border:1px dashed rgba(68,224,122,.25);border-radius:10px;display:flex;align-items:center;justify-content:space-between}
        .pcard-code.used-code{background:rgba(90,90,80,.06);border-color:var(--b,#1c1c19);border-style:solid}
        .pcard-code.expired-code{background:rgba(255,77,106,.04);border-color:rgba(255,77,106,.2);border-style:solid}
        .pcard-code code{font-size:17px;font-weight:800;letter-spacing:3px;font-family:'Courier New',monospace;color:var(--t,#eae6de)}
        .pcard-code.used-code code{color:var(--td,#5a5650);text-decoration:line-through}
        .pcard-code.expired-code code{color:var(--red,#ff4d6a);text-decoration:line-through}
        .copy-btn{background:rgba(68,224,122,.1);border:1px solid rgba(68,224,122,.2);color:var(--grn,#44e07a);padding:6px 12px;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:.2s;white-space:nowrap}
        .copy-btn:hover{background:rgba(68,224,122,.2)}
        .pcard-meta{padding:14px 18px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--b,#1c1c19);font-size:11px;color:var(--td,#5a5650)}
        .pcard-meta .price{color:var(--gold,#f0c850);font-weight:700;font-size:13px}
        .pcard-actions{padding:0 18px 16px;display:flex;gap:8px}
        .pcard-actions button{flex:1;padding:8px;border-radius:8px;font-size:11px;font-weight:600;border:1px solid var(--b,#1c1c19);background:rgba(255,255,255,.02);color:var(--tm,#908a7e);cursor:pointer;transition:.2s;font-family:'Inter',sans-serif}
        .pcard-actions button:hover{border-color:var(--goldD,#c9a832);color:var(--gold,#f0c850)}
        .empty-state{text-align:center;padding:80px 20px;color:var(--td,#5a5650)}
        .empty-state i{font-size:48px;margin-bottom:16px;display:block}
        .empty-state h3{font-family:'Playfair Display',serif;font-size:22px;color:var(--tm,#908a7e);margin-bottom:8px}
        .empty-state p{font-size:13px}
        .toast-el{position:fixed;bottom:24px;right:24px;z-index:300;background:#151513;border:1px solid var(--bl,#28281f);border-radius:11px;padding:11px 16px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500;transform:translateY(100px);opacity:0;transition:all .3s cubic-bezier(.22,1,.36,1);box-shadow:0 8px 24px rgba(0,0,0,.5)}
        .toast-el.show{transform:translateY(0);opacity:1}
        .toast-el.success{border-color:rgba(68,224,122,.3)}.toast-el.success i{color:var(--grn,#44e07a)}
        .toast-el.error{border-color:rgba(255,77,106,.3)}.toast-el.error i{color:var(--red,#ff4d6a)}
        @media(max-width:768px){
          .stat-cards{grid-template-columns:repeat(2,1fr)}
          .purchase-grid{grid-template-columns:1fr}
          .bdash-hdr{flex-direction:column;align-items:flex-start}
        }
      `}</style>

      <div className="bdash-wrap">
        <div className="bdash-inner">
          <div className="bdash-hdr">
            <div>
              <h1>My Purchases</h1>
              <div className="user-badge" style={{ marginTop: 6 }}>
                <div className="avatar">{userName.split(' ').map(w => w[0]).join('')}</div>
                {userName}
              </div>
            </div>
            <Link href="/browse" style={{ fontSize: 13, color: 'var(--tm,#908a7e)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} /> Browse More
            </Link>
          </div>

          <div className="stat-cards">
            <div className="stat-card">
              <div className="sc-label">Total Purchased</div>
              <div className="sc-val">{purchases.length}</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Active Codes</div>
              <div className="sc-val green">{activeCodes}</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Total Spent</div>
              <div className="sc-val red">₹{totalSpent.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Total Saved</div>
              <div className="sc-val gold">₹{totalSaved.toLocaleString()}</div>
            </div>
          </div>

          <div className="filter-bar">
            {[
              { key: 'all' as const, label: 'All' },
              { key: 'active' as const, label: 'Active' },
              { key: 'used' as const, label: 'Used' },
              { key: 'expired' as const, label: 'Expired' },
            ].map(f => (
              <button
                key={f.key}
                className={`fbtn${filter === f.key ? ' active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-receipt" />
              <h3>No purchases found</h3>
              <p>{filter === 'all' ? 'You haven\'t bought any coupons yet.' : `No ${filter} coupons.`}</p>
            </div>
          ) : (
            <div className="purchase-grid">
              {filtered.map(p => {
                const isExpired = new Date(p.expiry).getTime() <= now;
                const statusKey = p.used ? 'used' : isExpired ? 'expired' : 'active';
                const statusLabel = p.used ? 'Used' : isExpired ? 'Expired' : 'Active';

                return (
                  <div className={`pcard${p.used ? ' used' : ''}`} key={p.id}>
                    <div className="pcard-top">
                      <div className={`pcard-logo ${p.cat}`}>
                        <i className={CAT_ICONS[p.cat] || 'fa-solid fa-tag'} />
                      </div>
                      <div>
                        <div className="pcard-brand">{p.brand}</div>
                        <div className="pcard-cat">{CAT_LABELS[p.cat] || p.cat} · {p.discount}</div>
                      </div>
                      <span className={`pcard-badge ${statusKey === 'active' ? 'active' : statusKey === 'used' ? 'used-badge' : 'expired'}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className={`pcard-code${p.used ? ' used-code' : isExpired ? ' expired-code' : ''}`}>
                      <code>{p.code}</code>
                      {!p.used && !isExpired && (
                        <button className="copy-btn" onClick={() => copyCode(p.code)}>
                          <i className="fa-regular fa-copy" style={{ marginRight: 3 }} /> Copy
                        </button>
                      )}
                    </div>
                    <div className="pcard-meta">
                      <span>Bought {fmtD(p.purchasedAt)} · by {p.sellerName}</span>
                      <span className="price">₹{p.price}</span>
                    </div>
                    {!p.used && !isExpired && (
                      <div className="pcard-actions">
                        <button onClick={() => markUsed(p.id)}>
                          <i className="fa-solid fa-check" style={{ marginRight: 4, fontSize: 10 }} /> Mark as Used
                        </button>
                        <button>
                          <i className="fa-regular fa-flag" style={{ marginRight: 4, fontSize: 10 }} /> Report Issue
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
