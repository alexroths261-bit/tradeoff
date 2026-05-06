'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

interface ListedCoupon {
  id: number;
  brand: string;
  cat: string;
  price: number;
  original: number;
  expiry: string;
  status: string;
  views: number;
  sold: number;
  createdAt: string;
}

const CATEGORIES = [
  { key: 'food', label: 'Food & Dining' },
  { key: 'travel', label: 'Travel' },
  { key: 'fashion', label: 'Fashion' },
  { key: 'grocery', label: 'Grocery' },
  { key: 'electronics', label: 'Electronics' },
];

const FALLBACK_LISTED: ListedCoupon[] = [
  { id: 1, brand: 'Swiggy', cat: 'food', price: 45, original: 150, expiry: '2026-05-30', status: 'active', views: 1240, sold: 18, createdAt: '2026-01-15' },
  { id: 2, brand: 'Myntra', cat: 'fashion', price: 99, original: 500, expiry: '2026-03-10', status: 'active', views: 890, sold: 12, createdAt: '2026-02-01' },
  { id: 3, brand: 'Flipkart', cat: 'electronics', price: 199, original: 1000, expiry: '2026-06-30', status: 'active', views: 2100, sold: 34, createdAt: '2026-02-10' },
  { id: 4, brand: 'Zomato', cat: 'food', price: 15, original: 80, expiry: '2026-01-20', status: 'expired', views: 560, sold: 8, createdAt: '2025-12-01' },
  { id: 5, brand: 'Nykaa', cat: 'fashion', price: 149, original: 500, expiry: '2026-04-15', status: 'paused', views: 340, sold: 4, createdAt: '2026-02-18' },
];

function fmtD(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function SellerDashboardClient({ userId, userName }: { userId: string; userName: string }) {
  const [tab, setTab] = useState<'listed' | 'create'>('listed');
  const [listed, setListed] = useState<ListedCoupon[]>(FALLBACK_LISTED);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!brand || !category || !description || !couponCode || !originalValue || !listingPrice || !expiryDate) {
      showToast('All fields are required', 'error');
      return;
    }
    if (Number(listingPrice) >= Number(originalValue)) {
      showToast('Listing price must be less than original value', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/coupons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          category,
          description,
          couponCode,
          originalValue: Number(originalValue),
          listingPrice: Number(listingPrice),
          expiryDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Coupon listed successfully!', 'success');
        const newCoupon: ListedCoupon = {
          id: Date.now(),
          brand,
          cat: category,
          price: Number(listingPrice),
          original: Number(originalValue),
          expiry: expiryDate,
          status: 'active',
          views: 0,
          sold: 0,
          createdAt: new Date().toISOString(),
        };
        setListed([newCoupon, ...listed]);
        setBrand(''); setCategory(''); setDescription(''); setCouponCode('');
        setOriginalValue(''); setListingPrice(''); setExpiryDate('');
        setTab('listed');
      } else {
        showToast(data.error || 'Failed to list coupon', 'error');
      }
    } catch {
      showToast('Network error. Try again.', 'error');
    }
    setSubmitting(false);
  }

  function toggleStatus(id: number, currentStatus: string) {
    setListed(listed.map(c => c.id === id ? { ...c, status: currentStatus === 'active' ? 'paused' : 'active' } : c));
    showToast(`Coupon ${currentStatus === 'active' ? 'paused' : 'activated'}`, 'success');
  }

  const totalListed = listed.length;
  const activeListed = listed.filter(c => c.status === 'active').length;
  const totalSold = listed.reduce((a, c) => a + c.sold, 0);
  const totalEarnings = listed.reduce((a, c) => a + (c.price * c.sold), 0);

  return (
    <>
      <style>{`
        .sdash-wrap{min-height:100vh;background:var(--bg,#0a0a08);padding-top:60px;position:relative;z-index:1}
        .sdash-inner{max-width:1100px;margin:0 auto;padding:36px 24px 80px}
        .sdash-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:16px}
        .sdash-hdr h1{font-family:'Playfair Display',serif;font-size:30px;font-weight:800;color:var(--t,#eae6de);letter-spacing:-.4px}
        .sdash-hdr .user-badge{font-size:12px;color:var(--tm,#908a7e);display:flex;align-items:center;gap:6px}
        .sdash-hdr .user-badge .avatar{width:28px;height:28px;border-radius:50%;background:var(--bl,#28281f);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--tm,#908a7e);border:1px solid var(--b,#1c1c19)}
        .stat-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
        .stat-card{background:var(--card,#121212);border:1px solid var(--b,#1c1c19);border-radius:14px;padding:18px;transition:.2s}
        .stat-card:hover{border-color:rgba(240,200,80,.2)}
        .stat-card .sc-label{font-size:10px;color:var(--td,#5a5650);text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:6px}
        .stat-card .sc-val{font-family:'Playfair Display',serif;font-size:26px;font-weight:800;color:var(--t,#eae6de)}
        .stat-card .sc-val.gold{color:var(--gold,#f0c850)}
        .stat-card .sc-val.green{color:var(--grn,#44e07a)}
        .tab-bar{display:flex;gap:4px;background:var(--card,#121212);border:1px solid var(--b,#1c1c19);border-radius:12px;padding:4px;margin-bottom:24px;width:fit-content}
        .tab-btn{padding:9px 20px;border-radius:9px;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:.2s;font-family:'Inter',sans-serif;background:transparent;color:var(--tm,#908a7e)}
        .tab-btn.active{background:rgba(240,200,80,.15);color:var(--gold,#f0c850)}
        .tab-btn:hover:not(.active){color:var(--t,#eae6de)}
        .coupon-table{width:100%;border-collapse:separate;border-spacing:0 8px}
        .coupon-table th{font-size:10px;font-weight:700;color:var(--td,#5a5650);text-transform:uppercase;letter-spacing:.8px;text-align:left;padding:0 14px 10px}
        .coupon-table td{padding:14px;background:var(--card,#121212);font-size:13px;color:var(--t,#eae6de)}
        .coupon-table tr td:first-child{border-radius:10px 0 0 10px;border:1px solid var(--b,#1c1c19);border-right:none}
        .coupon-table tr td:last-child{border-radius:0 10px 10px 0;border:1px solid var(--b,#1c1c19);border-left:none}
        .coupon-table tr td:not(:first-child):not(:last-child){border-top:1px solid var(--b,#1c1c19);border-bottom:1px solid var(--b,#1c1c19)}
        .ct-brand{font-weight:700}
        .ct-cat{font-size:10px;color:var(--td,#5a5650);text-transform:uppercase;letter-spacing:.5px}
        .ct-price{font-weight:800;color:var(--gold,#f0c850)}
        .ct-original{font-size:11px;color:var(--td,#5a5650);text-decoration:line-through;margin-left:4px}
        .status-pill{font-size:10px;font-weight:700;padding:3px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:.5px;display:inline-block}
        .status-pill.active{background:rgba(68,224,122,.12);color:var(--grn,#44e07a);border:1px solid rgba(68,224,122,.2)}
        .status-pill.paused{background:rgba(240,200,80,.12);color:var(--gold,#f0c850);border:1px solid rgba(240,200,80,.2)}
        .status-pill.expired{background:rgba(255,77,106,.12);color:var(--red,#ff4d6a);border:1px solid rgba(255,77,106,.2)}
        .action-btn{padding:6px 12px;border-radius:7px;font-size:11px;font-weight:600;border:1px solid var(--b,#1c1c19);background:rgba(255,255,255,.02);color:var(--tm,#908a7e);cursor:pointer;transition:.2s;font-family:'Inter',sans-serif}
        .action-btn:hover{border-color:var(--goldD,#c9a832);color:var(--gold,#f0c850)}
        .action-btn.danger:hover{border-color:var(--red,#ff4d6a);color:var(--red,#ff4d6a)}
        .form-card{background:var(--card,#121212);border:1px solid var(--b,#1c1c19);border-radius:16px;padding:28px;max-width:640px}
        .form-card h2{font-family:'Playfair Display',serif;font-size:22px;font-weight:800;color:var(--t,#eae6de);margin-bottom:4px}
        .form-card .sub{font-size:12px;color:var(--td,#5a5650);margin-bottom:24px}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .fg{margin-bottom:0}
        .fg.full{grid-column:1/-1}
        .fg label{font-size:9px;font-weight:700;color:var(--tm,#908a7e);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:.6px}
        .fg input,.fg textarea,.fg select{width:100%;padding:10px 12px;background:rgba(255,255,255,.02);border:1px solid var(--b,#1c1c19);border-radius:10px;color:var(--t,#eae6de);font-size:13px;font-family:'Inter',sans-serif;outline:none;transition:.2s}
        .fg input:focus,.fg textarea:focus,.fg select:focus{border-color:var(--goldD,#c9a832);box-shadow:0 0 8px rgba(240,200,80,.1)}
        .fg input::placeholder,.fg textarea::placeholder{color:var(--td,#5a5650)}
        .fg textarea{resize:vertical;min-height:80px}
        .fg select{cursor:pointer}
        .fg select option{background:#1a1a18;color:var(--t,#eae6de)}
        .fg .hint{font-size:10px;color:var(--td,#5a5650);margin-top:3px}
        .form-submit{margin-top:20px}
        .submit-btn{background:linear-gradient(135deg,#f0c850 0%,#ffd966 40%,#ffe47a 50%,#ffd966 60%,#f0c850 100%);background-size:200% 200%;animation:shimmer 3s ease-in-out infinite;color:#0a0a08;border:none;padding:13px 32px;border-radius:11px;font-size:14px;font-weight:800;cursor:pointer;transition:all .25s;font-family:'Inter',sans-serif;box-shadow:0 2px 12px rgba(240,200,80,.12)}
        .submit-btn:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(240,200,80,.35)}
        .submit-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;animation:none}
        .empty-list{text-align:center;padding:60px 20px;color:var(--td,#5a5650)}
        .empty-list i{font-size:40px;margin-bottom:12px;display:block}
        .empty-list p{font-size:13px}
        .toast-el{position:fixed;bottom:24px;right:24px;z-index:300;background:#151513;border:1px solid var(--bl,#28281f);border-radius:11px;padding:11px 16px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500;transform:translateY(100px);opacity:0;transition:all .3s cubic-bezier(.22,1,.36,1);box-shadow:0 8px 24px rgba(0,0,0,.5)}
        .toast-el.show{transform:translateY(0);opacity:1}
        .toast-el.success{border-color:rgba(68,224,122,.3)}.toast-el.success i{color:var(--grn,#44e07a)}
        .toast-el.error{border-color:rgba(255,77,106,.3)}.toast-el.error i{color:var(--red,#ff4d6a)}
        @keyframes shimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @media(max-width:768px){
          .stat-cards{grid-template-columns:repeat(2,1fr)}
          .form-grid{grid-template-columns:1fr}
          .coupon-table{font-size:12px}
          .sdash-hdr{flex-direction:column;align-items:flex-start}
        }
      `}</style>

      <div className="sdash-wrap">
        <div className="sdash-inner">
          <div className="sdash-hdr">
            <div>
              <h1>Seller Dashboard</h1>
              <div className="user-badge" style={{ marginTop: 6 }}>
                <div className="avatar">{userName.split(' ').map(w => w[0]).join('')}</div>
                {userName}
              </div>
            </div>
            <Link href="/browse" style={{ fontSize: 13, color: 'var(--tm,#908a7e)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} /> Browse Coupons
            </Link>
          </div>

          <div className="stat-cards">
            <div className="stat-card">
              <div className="sc-label">Total Listed</div>
              <div className="sc-val">{totalListed}</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Active</div>
              <div className="sc-val gold">{activeListed}</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Total Sold</div>
              <div className="sc-val green">{totalSold}</div>
            </div>
            <div className="stat-card">
              <div className="sc-label">Earnings</div>
              <div className="sc-val gold">₹{totalEarnings.toLocaleString()}</div>
            </div>
          </div>

          <div className="tab-bar">
            <button className={`tab-btn${tab === 'listed' ? ' active' : ''}`} onClick={() => setTab('listed')}>
              <i className="fa-solid fa-list" style={{ marginRight: 5, fontSize: 11 }} /> My Coupons
            </button>
            <button className={`tab-btn${tab === 'create' ? ' active' : ''}`} onClick={() => setTab('create')}>
              <i className="fa-solid fa-plus" style={{ marginRight: 5, fontSize: 11 }} /> List New Coupon
            </button>
          </div>

          {tab === 'listed' ? (
            listed.length === 0 ? (
              <div className="empty-list">
                <i className="fa-solid fa-tag" />
                <p>No coupons listed yet. Click &quot;List New Coupon&quot; to get started.</p>
              </div>
            ) : (
              <table className="coupon-table">
                <thead>
                  <tr>
                    <th>Coupon</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Sold</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listed.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div className="ct-brand">{c.brand}</div>
                        <div className="ct-cat">{c.cat}</div>
                      </td>
                      <td>
                        <span className="ct-price">₹{c.price}</span>
                        <span className="ct-original">₹{c.original}</span>
                      </td>
                      <td><span className={`status-pill ${c.status}`}>{c.status}</span></td>
                      <td style={{ color: 'var(--tm,#908a7e)' }}>{c.views}</td>
                      <td style={{ color: 'var(--grn,#44e07a)', fontWeight: 600 }}>{c.sold}</td>
                      <td style={{ color: 'var(--td,#5a5650)', fontSize: 12 }}>{fmtD(c.expiry)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {(c.status === 'active' || c.status === 'paused') && (
                            <button className="action-btn" onClick={() => toggleStatus(c.id, c.status)}>
                              {c.status === 'active' ? 'Pause' : 'Activate'}
                            </button>
                          )}
                          <button className="action-btn danger">
                            <i className="fa-solid fa-trash" style={{ fontSize: 10 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            <div className="form-card">
              <h2>List a New Coupon</h2>
              <p className="sub">Fill in the details below. The coupon code will be encrypted and only revealed after purchase.</p>
              <form onSubmit={handleCreate}>
                <div className="form-grid">
                  <div className="fg">
                    <label>Brand</label>
                    <input type="text" placeholder="e.g. Swiggy, Myntra" value={brand} onChange={e => setBrand(e.target.value)} />
                  </div>
                  <div className="fg">
                    <label>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="fg full">
                    <label>Description</label>
                    <textarea placeholder="Describe what the coupon offers, conditions, minimum order, etc." value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                  <div className="fg full">
                    <label>Coupon Code</label>
                    <input type="text" placeholder="e.g. SWIGGY500" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} style={{ fontFamily: "'Courier New', monospace", letterSpacing: 2 }} />
                    <div className="hint">This will be encrypted and only shown to buyers after payment</div>
                  </div>
                  <div className="fg">
                    <label>Original Value (₹)</label>
                    <input type="number" placeholder="e.g. 500" value={originalValue} onChange={e => setOriginalValue(e.target.value)} />
                  </div>
                  <div className="fg">
                    <label>Listing Price (₹)</label>
                    <input type="number" placeholder="e.g. 99" value={listingPrice} onChange={e => setListingPrice(e.target.value)} />
                    <div className="hint">Must be less than original value</div>
                  </div>
                  <div className="fg">
                    <label>Expiry Date</label>
                    <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
                  </div>
                </div>
                <div className="form-submit">
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Listing...' : '⚡ List Coupon'}
                  </button>
                </div>
              </form>
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
