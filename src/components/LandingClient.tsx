'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Coupon {
  id: number;
  brand: string;
  initials: string;
  cat: string;
  discount: string;
  desc: string;
  price: number;
  original: number;
  expiry: string;
  rating: number;
  reviews: number;
  sellerName: string;
  featured: boolean;
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

const FALLBACK: Coupon[] = [
  { id: 1, brand: 'MakeMyTrip', initials: 'MM', cat: 'travel', discount: '₹2,000 off', desc: 'Flat ₹2000 off on domestic flight bookings. Valid on bookings above ₹5000.', price: 799, original: 2000, expiry: '2026-05-30', rating: 4.8, reviews: 124, sellerName: 'Rahul K.', featured: true },
  { id: 2, brand: 'Blinkit', initials: 'BL', cat: 'grocery', discount: '70% OFF', desc: 'Get 70% off on your first grocery order above ₹199. Maximum discount ₹150.', price: 30, original: 150, expiry: '2026-03-05', rating: 4.5, reviews: 89, sellerName: 'Priya S.', featured: true },
  { id: 3, brand: 'Myntra', initials: 'MY', cat: 'fashion', discount: '₹500 off', desc: 'Flat ₹500 off on fashion orders above ₹1999. Applicable on all brands.', price: 99, original: 500, expiry: '2026-03-10', rating: 4.7, reviews: 203, sellerName: 'Amit M.', featured: true },
  { id: 4, brand: 'Swiggy', initials: 'SW', cat: 'food', discount: '50% OFF', desc: '50% off for new users on orders above ₹150. Maximum discount ₹100.', price: 1, original: 100, expiry: '2026-05-01', rating: 4.9, reviews: 456, sellerName: 'Neha R.', featured: false },
  { id: 5, brand: 'Ajio', initials: 'AJ', cat: 'fashion', discount: '50% OFF', desc: 'Extra 50% off on ajio.com. Valid on selected styles. No minimum order value.', price: 449, original: 1200, expiry: '2026-04-15', rating: 4.3, reviews: 67, sellerName: 'Vikram D.', featured: false },
  { id: 6, brand: 'Uber Eats', initials: 'UE', cat: 'food', discount: '20% OFF', desc: '20% off up to ₹75 on your next 3 orders. Minimum order ₹199.', price: 25, original: 225, expiry: '2026-06-15', rating: 4.6, reviews: 178, sellerName: 'Sana K.', featured: false },
  { id: 7, brand: 'Goibibo', initials: 'GO', cat: 'travel', discount: '₹1,500 off', desc: 'Flat ₹1500 off on hotel bookings above ₹4000. Pan India properties.', price: 550, original: 1500, expiry: '2026-04-22', rating: 4.4, reviews: 92, sellerName: 'Deepak T.', featured: false },
  { id: 8, brand: 'Croma', initials: 'CR', cat: 'electronics', discount: '20% OFF', desc: '20% off on electronics & accessories. Max discount ₹3000. Above ₹5000.', price: 299, original: 3000, expiry: '2026-07-01', rating: 4.2, reviews: 54, sellerName: 'Ritu P.', featured: false },
  { id: 9, brand: 'Zomato', initials: 'ZO', cat: 'food', discount: '₹80 off', desc: 'Flat ₹80 off on food orders above ₹249. Valid once per user.', price: 15, original: 80, expiry: '2026-05-20', rating: 4.7, reviews: 312, sellerName: 'Karan J.', featured: false },
  { id: 10, brand: 'Flipkart', initials: 'FK', cat: 'electronics', discount: '₹1,000 off', desc: '₹1000 off on electronics above ₹10000. Axis & ICICI cards.', price: 199, original: 1000, expiry: '2026-06-30', rating: 4.5, reviews: 245, sellerName: 'Anita G.', featured: false },
  { id: 11, brand: 'Nykaa', initials: 'NK', cat: 'fashion', discount: '25% OFF', desc: '25% off on beauty & personal care. Min order ₹800. All brands.', price: 149, original: 500, expiry: '2026-04-15', rating: 4.6, reviews: 134, sellerName: 'Meera V.', featured: false },
  { id: 12, brand: 'BigBasket', initials: 'BB', cat: 'grocery', discount: '₹200 off', desc: 'Flat ₹200 off on grocery orders above ₹1000. First order only.', price: 49, original: 200, expiry: '2026-05-10', rating: 4.3, reviews: 78, sellerName: 'Arjun B.', featured: false },
];

function savePct(p: number, o: number) { return Math.round((1 - p / o) * 100); }
function fmtD(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
function getInitials(name: string) { return name.split(' ').map(w => w[0]).join(''); }

export default function LandingClient({ coupons: propCoupons }: { coupons: Coupon[] }) {
  const coupons = propCoupons && propCoupons.length > 0 ? propCoupons : FALLBACK;

  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null);
  const [payState, setPayState] = useState<'idle' | 'processing' | 'done'>('idle');
  const [revealedCode, setRevealedCode] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const filtered = coupons.filter(c => {
    const matchCat = activeFilter === 'all' || c.cat === activeFilter;
    const matchSearch = !search || c.brand.toLowerCase().includes(search.toLowerCase()) || c.cat.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function openPurchase(c: Coupon) {
    setCurrentCoupon(c);
    setPayState('idle');
    setRevealedCode('');
    setPurchaseModal(true);
    document.body.style.overflow = 'hidden';
  }

  function simulatePayment() {
    if (!currentCoupon) return;
    setPayState('processing');
    setTimeout(() => {
      const code = 'TROF' + currentCoupon.id + Math.random().toString(36).substring(2, 6).toUpperCase();
      setRevealedCode(code);
      setPayState('done');
      showToast('Payment successful! Code revealed.', 'success');
    }, 2000);
  }

  function copyCode() {
    navigator.clipboard.writeText(revealedCode);
    showToast('Code copied!', 'success');
  }

  function closeModal() {
    setPurchaseModal(false);
    document.body.style.overflow = '';
  }

  /* ── Particle System ── */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    if (!cx) return;
    let cW = 0, cH = 0;

    function rsz() { cW = cv.width = window.innerWidth; cH = cv.height = window.innerHeight; }
    rsz();
    window.addEventListener('resize', rsz);

    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);

    const COUNT = 100;
    const pts: any[] = [];

    function mkP(init: boolean) {
      const sz = Math.random() < 0.08 ? 2.5 + Math.random() * 2 : 0.5 + Math.random() * 1.8;
      return {
        x: Math.random() * cW, y: init ? Math.random() * cH : cH + 20 + Math.random() * 100,
        size: sz, sY: -(0.15 + Math.random() * 0.6), sX: (Math.random() - 0.5) * 0.3,
        op: 0.1 + Math.random() * 0.5, mOp: 0.1 + Math.random() * 0.5,
        ph: Math.random() * 6.28, ts: 0.01 + Math.random() * 0.03,
        hue: 40 + Math.random() * 15, sat: 70 + Math.random() * 30, lit: 55 + Math.random() * 20,
        gr: sz * (sz > 3 ? 8 : 3), star: sz > 3, trail: [] as any[],
      };
    }
    for (let i = 0; i < COUNT; i++) pts.push(mkP(true));

    let raf = 0;
    function loop() {
      cx.clearRect(0, 0, cW, cH);
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          if (!pts[i].star && !pts[j].star) continue;
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            const a = (1 - d / 100) * 0.06 * Math.min(pts[i].op, pts[j].op);
            cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y);
            cx.strokeStyle = `rgba(240,200,80,${a})`; cx.lineWidth = 0.5; cx.stroke();
          }
        }
      }

      for (let k = 0; k < COUNT; k++) {
        const p = pts[k];
        p.ph += p.ts;
        p.op = p.mOp * (0.5 + 0.5 * Math.sin(p.ph));
        const dx2 = mx - p.x, dy2 = my - p.y, d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (d2 < 150 && d2 > 0) {
          const f2 = (1 - d2 / 150) * 0.8;
          p.sX -= (dx2 / d2) * f2 * 0.15;
          p.sY -= (dy2 / d2) * f2 * 0.1;
          p.op = Math.min(1, p.mOp + f2 * 0.6);
        }
        if (p.star) { p.trail.push({ x: p.x, y: p.y, op: p.op * 0.3 }); if (p.trail.length > 8) p.trail.shift(); }
        p.x += p.sX; p.y += p.sY; p.sX *= 0.995; p.sX += (Math.random() - 0.5) * 0.02;
        if (p.y < -30 || p.x < -30 || p.x > cW + 30) Object.assign(p, mkP(false));

        if (p.star) {
          for (let t = 0; t < p.trail.length; t++) {
            const tr = p.trail[t], ta = tr.op * (t / p.trail.length) * 0.5;
            cx.beginPath(); cx.arc(tr.x, tr.y, p.size * 0.6, 0, 6.28);
            cx.fillStyle = `hsla(${p.hue},${p.sat}%,${p.lit}%,${ta})`; cx.fill();
          }
        }

        const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.gr);
        g.addColorStop(0, `hsla(${p.hue},${p.sat}%,${p.lit}%,${p.op * 0.6})`);
        g.addColorStop(0.4, `hsla(${p.hue},${p.sat}%,${p.lit}%,${p.op * 0.15})`);
        g.addColorStop(1, `hsla(${p.hue},${p.sat}%,${p.lit}%,0)`);
        cx.beginPath(); cx.arc(p.x, p.y, p.gr, 0, 6.28); cx.fillStyle = g; cx.fill();

        cx.beginPath(); cx.arc(p.x, p.y, p.size, 0, 6.28);
        cx.fillStyle = `hsla(${p.hue},${p.sat}%,${p.lit + 15}%,${p.op})`; cx.fill();

        if (p.star && p.op > 0.3) {
          cx.save(); cx.translate(p.x, p.y); cx.rotate(p.ph * 0.5);
          const sL = p.size * 3 * p.op;
          cx.strokeStyle = `hsla(${p.hue},100%,80%,${p.op * 0.4})`; cx.lineWidth = 0.5;
          for (let s = 0; s < 4; s++) { cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(sL, 0); cx.stroke(); cx.rotate(Math.PI / 4); }
          cx.restore();
        }
      }
      raf = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', rsz);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  /* ── Counter Animation ── */
  const [counters, setCounters] = useState([0, 0, 0, 0]);
  const counterTargets = [12480, 5200, 94, 2400];
  const counterLabels = ['Coupons Sold', 'Active Users', 'Success Rate', 'Traded This Month'];

  useEffect(() => {
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / 2000, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCounters(counterTargets.map(t => Math.floor(ease * t)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, []);

  function fmtCounter(v: number, i: number) {
    if (i === 0 || i === 1 || i === 3) return v >= 1000 ? (v / 1000).toFixed(1) + 'K+' : v + '+';
    return v + (i === 2 ? '%' : '');
  }

  return (
    <>
      <style>{`
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        :root{--bg:#0a0a08;--card:#121212;--gold:#f0c850;--goldD:#c9a832;--gs:linear-gradient(135deg,#f0c850 0%,#ffd966 40%,#ffe47a 50%,#ffd966 60%,#f0c850 100%);--gg:rgba(240,200,80,.12);--ggm:rgba(240,200,80,.25);--ggs:rgba(240,200,80,.4);--t:#eae6de;--tm:#908a7e;--td:#5a5650;--b:#1c1c19;--bl:#28281f;--red:#ff4d6a;--grn:#44e07a}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--t);min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
        h1,h2,h3{font-family:'Playfair Display',serif}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--bl);border-radius:3px}
        .particle-cv{position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none}
        .hero{min-height:90vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:100px 24px 50px;position:relative;z-index:1;overflow:hidden}
        .hero::before{content:'';position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:800px;height:800px;background:radial-gradient(circle,rgba(240,200,80,.08) 0%,transparent 70%);pointer-events:none}
        .hero-badge{display:inline-flex;align-items:center;gap:7px;background:var(--gg);border:1px solid rgba(240,200,80,.18);padding:5px 15px;border-radius:100px;font-size:11px;font-weight:500;color:var(--gold);margin-bottom:28px;animation:fiu .6s ease both}
        .hero-badge .dot{width:5px;height:5px;background:var(--gold);border-radius:50%;animation:pd 2s infinite;box-shadow:0 0 6px var(--gold)}
        .hero h1{font-size:clamp(44px,7.5vw,86px);font-weight:900;line-height:.93;letter-spacing:-2.5px;margin-bottom:6px;animation:fiu .6s ease .1s both}
        .hero h1 .gold{background:var(--gs);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3s ease-in-out infinite}
        .hero-sub{font-size:clamp(15px,2.2vw,19px);color:var(--tm);font-weight:300;max-width:500px;margin:20px auto 36px;line-height:1.6;animation:fiu .6s ease .2s both}
        .hero-btns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;animation:fiu .6s ease .3s both}
        .hbtn-gold{background:var(--gs);background-size:200% 200%;color:#0a0a08;border:none;padding:14px 32px;border-radius:13px;font-size:14px;font-weight:700;cursor:pointer;transition:.25s;font-family:'Inter',sans-serif;text-decoration:none;display:inline-flex;align-items:center;gap:7px;animation:shimmer 3s ease-in-out infinite;box-shadow:0 2px 12px var(--gg)}
        .hbtn-gold:hover{transform:translateY(-2px);box-shadow:0 6px 28px var(--ggs)}
        .hbtn-out{background:transparent;color:var(--gold);border:1px solid var(--goldD);padding:14px 32px;border-radius:13px;font-size:14px;font-weight:600;cursor:pointer;transition:.25s;font-family:'Inter',sans-serif;text-decoration:none;display:inline-flex;align-items:center;gap:7px}
        .hbtn-out:hover{background:var(--gg);border-color:var(--gold)}
        .hero-trust{display:flex;gap:28px;margin-top:48px;flex-wrap:wrap;justify-content:center;animation:fiu .6s ease .4s both}
        .hero-trust-item{display:flex;align-items:center;gap:8px;color:var(--td);font-size:12px}
        .hero-trust-item i{color:var(--gold);font-size:13px}
        .stats-bar{border-top:1px solid var(--b);border-bottom:1px solid var(--b);background:rgba(15,15,13,.6);backdrop-filter:blur(10px);position:relative;z-index:1}
        .stats-inner{max-width:1280px;margin:0 auto;padding:30px 24px;display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
        .stat-item{text-align:center}
        .stat-num{font-family:'Playfair Display',serif;font-size:30px;font-weight:800;background:var(--gs);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s ease-in-out infinite;line-height:1}
        .stat-label{font-size:10px;color:var(--tm);margin-top:5px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px}
        .section{max-width:1280px;margin:0 auto;padding:70px 24px;position:relative;z-index:1}
        .sec-hdr{margin-bottom:32px}.sec-hdr h2{font-size:30px;font-weight:800;letter-spacing:-.4px}.sec-hdr p{color:var(--tm);font-size:13px;margin-top:3px}
        .filter-row{display:flex;align-items:center;gap:10px;margin-bottom:28px;flex-wrap:wrap}
        .search-wrap{position:relative;flex:0 0 320px}
        .search-wrap input{width:100%;padding:10px 14px 10px 38px;background:var(--card);border:1px solid var(--b);border-radius:10px;color:var(--t);font-size:13px;outline:none;transition:.2s;font-family:'Inter',sans-serif}
        .search-wrap input::placeholder{color:var(--td)}
        .search-wrap input:focus{border-color:var(--goldD);box-shadow:0 0 12px var(--gg)}
        .search-wrap i{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--td);font-size:13px}
        .filter-chips{display:flex;gap:7px;flex-wrap:wrap}
        .filter-chip{background:var(--card);border:1px solid var(--b);color:var(--tm);padding:8px 15px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;transition:.2s;font-family:'Inter',sans-serif;white-space:nowrap}
        .filter-chip:hover{border-color:var(--goldD);color:var(--t)}
        .filter-chip.active{background:var(--ggm);border-color:var(--goldD);color:var(--gold);box-shadow:0 0 14px var(--gg)}
        .coupon-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
        .cc{background:var(--card);border:1px solid var(--b);border-radius:16px;padding:18px;transition:all .3s ease;cursor:pointer;display:flex;flex-direction:column;gap:11px}
        .cc:hover{border-color:rgba(240,200,80,.22);transform:translateY(-3px);box-shadow:0 10px 32px rgba(0,0,0,.45)}
        .cc-hdr{display:flex;justify-content:space-between;align-items:center}
        .cc-brand{display:flex;align-items:center;gap:10px}
        .cc-logo{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.3)}
        .cc-logo.food{background:linear-gradient(135deg,#ff4d6a,#d93050)}
        .cc-logo.travel{background:linear-gradient(135deg,#5a9be6,#3a78c0)}
        .cc-logo.fashion{background:linear-gradient(135deg,#d07ae6,#a84dc0)}
        .cc-logo.grocery{background:linear-gradient(135deg,#44e07a,#2cb85e)}
        .cc-logo.electronics{background:linear-gradient(135deg,#ffb020,#d99510)}
        .cc-bname{font-size:14px;font-weight:700;color:var(--t)}
        .cc-bcat{font-size:10px;color:var(--td);text-transform:uppercase;letter-spacing:.6px;margin-top:1px}
        .cc-badge{background:var(--gs);background-size:200% 200%;animation:shimmer 3s ease-in-out infinite;color:#0a0a08;font-size:11px;font-weight:800;padding:4px 10px;border-radius:6px;white-space:nowrap;box-shadow:0 1px 6px var(--gg)}
        .cc-desc{font-size:12px;color:var(--tm);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .cc-code{background:repeating-linear-gradient(135deg,#1a1a18 0px,#1a1a18 8px,#1e1e1c 8px,#1e1e1c 16px);border:1px solid var(--b);border-radius:8px;padding:9px 14px;display:flex;align-items:center;justify-content:space-between}
        .cc-code-mask{font-size:13px;letter-spacing:3px;color:var(--td);filter:blur(2.5px);user-select:none;font-family:'Courier New',monospace;font-weight:600}
        .cc-code-lock{color:var(--td);font-size:11px;display:flex;align-items:center;gap:5px}
        .cc-pricing{display:flex;flex-direction:column;gap:3px}
        .cc-price-row{display:flex;align-items:baseline;gap:6px}
        .cc-price{font-size:22px;font-weight:800;color:var(--t)}
        .cc-price-old{font-size:13px;color:var(--td);text-decoration:line-through}
        .cc-save{font-size:11px;color:var(--grn);font-weight:600}
        .cc-meta{display:flex;justify-content:space-between;align-items:center;padding-top:9px;border-top:1px solid var(--b)}
        .cc-seller{display:flex;align-items:center;gap:6px}
        .cc-avatar{width:22px;height:22px;border-radius:50%;background:var(--bl);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:var(--tm);border:1px solid var(--b)}
        .cc-sname{font-size:11px;color:var(--tm);font-weight:500}
        .cc-cta{background:var(--gs);background-size:200% 200%;animation:shimmer 3s ease-in-out infinite;color:#0a0a08;border:none;padding:12px 0;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;transition:all .25s;font-family:'Inter',sans-serif;box-shadow:0 2px 10px var(--gg);text-align:center;width:100%}
        .cc-cta:hover{transform:translateY(-1px);box-shadow:0 4px 18px var(--ggs)}
        .modal-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.75);backdrop-filter:blur(10px);display:none;align-items:center;justify-content:center;padding:24px}
        .modal-overlay.show{display:flex;animation:fi .2s ease}
        .modal{background:#131311;border:1px solid var(--bl);border-radius:20px;max-width:460px;width:100%;overflow:hidden;animation:su .3s ease;box-shadow:0 0 50px var(--gg),0 20px 40px rgba(0,0,0,.6)}
        .modal-hdr{padding:20px 20px 0;display:flex;justify-content:space-between;align-items:flex-start}
        .modal-close{background:rgba(255,255,255,.04);border:1px solid var(--b);color:var(--tm);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:.2s}
        .modal-close:hover{color:var(--t);border-color:var(--goldD)}
        .modal-body{padding:20px}
        .modal-disc{font-size:22px;font-weight:800;color:#fff;font-family:'Playfair Display',serif;margin-bottom:5px}
        .modal-desc-t{font-size:13px;color:var(--tm);line-height:1.6;margin-bottom:18px}
        .modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:18px}
        .mgi{background:rgba(255,255,255,.02);border:1px solid var(--b);border-radius:10px;padding:12px}
        .mgi label{font-size:9px;text-transform:uppercase;letter-spacing:.8px;color:var(--td);display:block;margin-bottom:2px}
        .mgi span{font-size:13px;font-weight:700}
        .modal-steps{display:flex;gap:9px;margin-bottom:18px}
        .mstep{flex:1;text-align:center;background:rgba(255,255,255,.02);border:1px solid var(--b);border-radius:10px;padding:12px 6px}
        .mstep-n{width:22px;height:22px;border-radius:50%;background:var(--ggm);color:var(--gold);font-size:10px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;margin-bottom:4px}
        .mstep p{font-size:10px;color:var(--tm)}
        .modal .cc-cta{padding:13px;font-size:14px;border-radius:12px}
        .code-reveal{background:linear-gradient(135deg,rgba(68,224,122,.07),rgba(68,224,122,.02));border:1px dashed rgba(68,224,122,.3);border-radius:10px;padding:18px;text-align:center;margin-top:12px;display:none}
        .code-reveal.show{display:block;animation:fiu .4s ease}
        .code-reveal label{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--grn);display:block;margin-bottom:6px;font-weight:700}
        .code-reveal code{font-size:22px;font-weight:800;color:var(--t);letter-spacing:4px;font-family:'Courier New',monospace}
        .code-reveal .copy-btn{margin-top:10px;background:rgba(68,224,122,.1);border:1px solid rgba(68,224,122,.2);color:var(--grn);padding:7px 16px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:.2s}
        .code-reveal .copy-btn:hover{background:rgba(68,224,122,.2)}
        .toast-el{position:fixed;bottom:24px;right:24px;z-index:300;background:#151513;border:1px solid var(--bl);border-radius:11px;padding:11px 16px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500;transform:translateY(100px);opacity:0;transition:all .3s cubic-bezier(.22,1,.36,1);box-shadow:0 8px 24px rgba(0,0,0,.5)}
        .toast-el.show{transform:translateY(0);opacity:1}
        .toast-el.success{border-color:rgba(68,224,122,.3)}.toast-el.success i{color:var(--grn)}
        .toast-el.error{border-color:rgba(255,77,106,.3)}.toast-el.error i{color:var(--red)}
        .footer{border-top:1px solid var(--b);padding:36px 24px 24px;text-align:center;position:relative;z-index:1}
        .footer-logo{font-family:'Playfair Display',serif;font-size:18px;font-weight:800;color:var(--gold);margin-bottom:8px}
        .footer p{font-size:11px;color:var(--td)}
        .footer-links{display:flex;gap:16px;justify-content:center;margin-top:12px}
        .footer-links a{font-size:11px;color:var(--tm);text-decoration:none;transition:.2s}
        .footer-links a:hover{color:var(--gold)}
        @keyframes shimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes fiu{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes su{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes pd{0%,100%{opacity:1}50%{opacity:.3}}
        @media(max-width:1024px){.coupon-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:680px){.coupon-grid{grid-template-columns:1fr}.stats-inner{grid-template-columns:repeat(2,1fr)}.search-wrap{flex:0 0 100%}.filter-chips{overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px}}
      `}</style>

      <canvas ref={canvasRef} className="particle-cv" />

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge"><span className="dot" /> India&apos;s #1 Coupon Marketplace</div>
        <h1>Buy &amp; Sell<br /><span className="gold">Discount Coupons</span></h1>
        <p className="hero-sub">Get premium coupons at a fraction of their value. Sell unused coupons for instant cash.</p>
        <div className="hero-btns">
          <Link href="/browse" className="hbtn-gold"><i className="fa-solid fa-compass" /> Browse Coupons</Link>
          <Link href="/dashboard/seller" className="hbtn-out"><i className="fa-solid fa-tag" /> List Your Coupon</Link>
        </div>
        <div className="hero-trust">
          <div className="hero-trust-item"><i className="fa-solid fa-shield-halved" /> Secure Payments</div>
          <div className="hero-trust-item"><i className="fa-solid fa-bolt" /> Instant Delivery</div>
          <div className="hero-trust-item"><i className="fa-solid fa-star" /> Verified Sellers</div>
          <div className="hero-trust-item"><i className="fa-solid fa-rotate-left" /> Full Refund</div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stats-inner">
          {counterTargets.map((_, i) => (
            <div className="stat-item" key={i}>
              <div className="stat-num">{fmtCounter(counters[i], i)}</div>
              <div className="stat-label">{counterLabels[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* COUPONS */}
      <section className="section" id="browse">
        <div className="sec-hdr"><h2>All Coupons</h2><p>Find the best deals across top brands</p></div>
        <div className="filter-row">
          <div className="search-wrap">
            <i className="fa-solid fa-magnifying-glass" />
            <input type="text" placeholder="Search brands..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-chips">
            {[
              { key: 'all', label: 'All Coupons', icon: '' },
              { key: 'food', label: 'Food', icon: 'fa-solid fa-utensils' },
              { key: 'travel', label: 'Travel', icon: 'fa-solid fa-plane' },
              { key: 'fashion', label: 'Fashion', icon: 'fa-solid fa-shirt' },
              { key: 'grocery', label: 'Grocery', icon: 'fa-solid fa-cart-shopping' },
              { key: 'electronics', label: 'Electronics', icon: 'fa-solid fa-laptop' },
            ].map(f => (
              <button
                key={f.key}
                className={`filter-chip${activeFilter === f.key ? ' active' : ''}`}
                onClick={() => setActiveFilter(f.key)}
              >
                {f.icon && <i className={f.icon} style={{ marginRight: 3, fontSize: 10 }} />}
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="coupon-grid">
          {filtered.map(c => (
            <div className="cc" key={c.id} onClick={() => openPurchase(c)}>
              <div className="cc-hdr">
                <div className="cc-brand">
                  <div className={`cc-logo ${c.cat}`}><i className={CAT_ICONS[c.cat] || 'fa-solid fa-tag'} /></div>
                  <div><div className="cc-bname">{c.brand}</div><div className="cc-bcat">{CAT_LABELS[c.cat] || c.cat}</div></div>
                </div>
                <div className="cc-badge">{c.discount}</div>
              </div>
              <div className="cc-desc">{c.desc}</div>
              <div className="cc-code">
                <span className="cc-code-mask">XXXX-XXXX-XX</span>
                <span className="cc-code-lock"><i className="fa-solid fa-lock" style={{ fontSize: 9 }} /> Hidden until payment</span>
              </div>
              <div className="cc-pricing">
                <div className="cc-price-row">
                  <span className="cc-price">₹{c.price}</span>
                  <span className="cc-price-old">₹{c.original}</span>
                </div>
                <div className="cc-save">You save {savePct(c.price, c.original)}%</div>
              </div>
              <div className="cc-meta">
                <div className="cc-seller">
                  <div className="cc-avatar">{getInitials(c.sellerName)}</div>
                  <span className="cc-sname">{c.sellerName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 10, color: 'var(--td)' }}><i className="fa-solid fa-star" style={{ color: 'var(--gold)', fontSize: 9 }} /> {c.rating}</span>
                  <span style={{ fontSize: 10, color: 'var(--td)' }}>({c.reviews})</span>
                  <span style={{ fontSize: 10, color: 'var(--td)' }}>{fmtD(c.expiry)}</span>
                </div>
              </div>
              <button className="cc-cta" onClick={e => { e.stopPropagation(); openPurchase(c); }}>
                ⚡ Buy Now — ₹{c.price}
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--td)', padding: '60px 0', fontSize: 15 }}>
              No coupons found matching your criteria.
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">TradeOff</div>
        <p>India&apos;s trusted marketplace for buying &amp; selling discount coupons.</p>
        <div className="footer-links">
          <Link href="#">About</Link>
          <Link href="#">How It Works</Link>
          <Link href="#">Privacy</Link>
          <Link href="#">Terms</Link>
          <Link href="#">Support</Link>
        </div>
        <p style={{ marginTop: 18 }}>&copy; 2026 TradeOff. All rights reserved.</p>
      </footer>

      {/* PURCHASE MODAL */}
      <div className={`modal-overlay${purchaseModal ? ' show' : ''}`} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
        {currentCoupon && (
          <div className="modal">
            <div className="modal-hdr">
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div className={`cc-logo ${currentCoupon.cat}`} style={{ width: 44, height: 44, fontSize: 18, borderRadius: 12 }}>
                  <i className={CAT_ICONS[currentCoupon.cat] || 'fa-solid fa-tag'} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{currentCoupon.brand}</div>
                  <div style={{ fontSize: 10, color: 'var(--td)', textTransform: 'uppercase', letterSpacing: '.7px', marginTop: 1 }}>{CAT_LABELS[currentCoupon.cat]}</div>
                </div>
              </div>
              <button className="modal-close" onClick={closeModal}><i className="fa-solid fa-xmark" /></button>
            </div>
            <div className="modal-body">
              <div className="modal-disc">{currentCoupon.discount}</div>
              <p className="modal-desc-t">{currentCoupon.desc}</p>
              <div className="modal-grid">
                <div className="mgi"><label>Listing Price</label><span style={{ color: 'var(--gold)' }}>₹{currentCoupon.price}</span></div>
                <div className="mgi"><label>Original Value</label><span>₹{currentCoupon.original}</span></div>
                <div className="mgi"><label>You Save</label><span style={{ color: 'var(--grn)' }}>₹{currentCoupon.original - currentCoupon.price} ({savePct(currentCoupon.price, currentCoupon.original)}%)</span></div>
                <div className="mgi"><label>Expires</label><span>{fmtD(currentCoupon.expiry)}</span></div>
              </div>
              <div className="modal-steps">
                <div className="mstep"><div className="mstep-n">1</div><p>Pay via Razorpay</p></div>
                <div className="mstep"><div className="mstep-n">2</div><p>Get Code Instantly</p></div>
              </div>
              <button
                className="cc-cta"
                disabled={payState !== 'idle'}
                onClick={simulatePayment}
                style={{
                  opacity: payState === 'idle' ? 1 : 0.6,
                  background: payState === 'done' ? 'linear-gradient(135deg,#44e07a,#2cb85e)' : undefined,
                  animation: payState === 'idle' ? 'shimmer 3s ease-in-out infinite' : 'none',
                }}
              >
                {payState === 'idle' && `⚡ Buy Now — ₹${currentCoupon.price}`}
                {payState === 'processing' && 'Processing payment...'}
                {payState === 'done' && '✓ Payment Complete'}
              </button>
              <div className={`code-reveal${revealedCode ? ' show' : ''}`}>
                <label>Your Coupon Code</label>
                <code>{revealedCode}</code>
                <br />
                <button className="copy-btn" onClick={copyCode}><i className="fa-regular fa-copy" /> Copy Code</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TOAST */}
      <div className={`toast-el${toast ? ' show' : ''} ${toast?.type || ''}`}>
        <i className={toast?.type === 'success' ? 'fa-solid fa-check-circle' : 'fa-solid fa-exclamation-circle'} />
        <span>{toast?.msg}</span>
      </div>
    </>
  );
}
