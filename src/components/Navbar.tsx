'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [authModal, setAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const isDashboard = pathname.startsWith('/dashboard');
  const isHome = pathname === '/';
  const isBrowse = pathname === '/browse';

  function openAuth(mode: 'signin' | 'signup') {
    setAuthMode(mode);
    setAuthModal(true);
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    setAuthModal(false);
    document.body.style.overflow = '';
  }

  function doAuth(mode: 'signin' | 'signup') {
    if (mode === 'signin') {
      const e = (document.getElementById('nav-signin-email') as HTMLInputElement)?.value;
      const p = (document.getElementById('nav-signin-pass') as HTMLInputElement)?.value;
      if (!e || !p) { setToast({ msg: 'Fill all fields', type: 'error' }); return; }
      setToast({ msg: 'Signed in!', type: 'success' });
    } else {
      const e = (document.getElementById('nav-signup-email') as HTMLInputElement)?.value;
      const p = (document.getElementById('nav-signup-pass') as HTMLInputElement)?.value;
      const pc = (document.getElementById('nav-signup-passc') as HTMLInputElement)?.value;
      if (!e || !p || !pc) { setToast({ msg: 'Fill all fields', type: 'error' }); return; }
      if (p !== pc) { setToast({ msg: "Passwords don't match", type: 'error' }); return; }
      if (p.length < 8) { setToast({ msg: 'Password must be 8+ characters', type: 'error' }); return; }
      setToast({ msg: 'Account created!', type: 'success' });
    }
    setTimeout(() => closeModal(), 700);
  }

  return (
    <>
      <style>{`
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(10,10,8,.9);backdrop-filter:blur(20px);border-bottom:1px solid var(--b,#1c1c19)}
        .nav-inner{max-width:1280px;margin:0 auto;padding:0 24px;height:60px;display:flex;align-items:center;justify-content:space-between}
        .nav-logo{font-family:'Playfair Display',serif;font-size:21px;font-weight:800;background:linear-gradient(135deg,#f0c850 0%,#ffd966 40%,#ffe47a 50%,#ffd966 60%,#f0c850 100%);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3s ease-in-out infinite;text-decoration:none}
        .nav-logo span{-webkit-text-fill-color:var(--t,#eae6de)}
        .nav-links{display:flex;align-items:center;gap:4px}
        .nav-links a,.nav-links button{color:var(--tm,#908a7e);text-decoration:none;font-size:13px;font-weight:500;padding:7px 13px;border-radius:8px;transition:.2s;background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif}
        .nav-links a:hover,.nav-links button:hover{color:var(--t,#eae6de);background:rgba(255,255,255,.04)}
        .nav-links a.active{color:var(--gold,#f0c850);background:rgba(240,200,80,.08)}
        .nav-gold{background:linear-gradient(135deg,#f0c850 0%,#ffd966 40%,#ffe47a 50%,#ffd966 60%,#f0c850 100%)!important;background-size:200% 200%!important;color:#0a0a08!important;border:none!important;padding:8px 16px!important;border-radius:9px!important;font-size:12px!important;font-weight:700!important;cursor:pointer!important;transition:.25s!important;font-family:'Inter',sans-serif!important;text-decoration:none!important;display:inline-flex!important;align-items:center!important;gap:5px!important;animation:shimmer 3s ease-in-out infinite!important;box-shadow:0 2px 10px rgba(240,200,80,.12)!important}
        .nav-gold:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(240,200,80,.4)!important}
        .nav-divider{width:1px;height:20px;background:var(--b,#1c1c19);margin:0 6px}
        .modal-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.75);backdrop-filter:blur(10px);display:none;align-items:center;justify-content:center;padding:24px}
        .modal-overlay.show{display:flex;animation:fi .2s ease}
        .modal{background:#131311;border:1px solid var(--bl,#28281f);border-radius:20px;max-width:380px;width:100%;overflow:hidden;animation:su .3s ease;box-shadow:0 0 50px rgba(240,200,80,.12),0 20px 40px rgba(0,0,0,.6)}
        .modal-hdr{padding:20px 20px 0;display:flex;justify-content:space-between;align-items:flex-start}
        .modal-close{background:rgba(255,255,255,.04);border:1px solid var(--b,#1c1c19);color:var(--tm,#908a7e);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:.2s}
        .modal-close:hover{color:var(--t,#eae6de);border-color:var(--goldD,#c9a832)}
        .modal-body{padding:24px 20px}
        .modal-body h2{font-size:24px;font-weight:800;margin-bottom:2px;text-align:center}
        .modal-body .asub{text-align:center;color:var(--tm,#908a7e);font-size:11px;margin-bottom:22px}
        .fg{margin-bottom:12px}
        .fg label{font-size:9px;font-weight:700;color:var(--tm,#908a7e);display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:.6px}
        .fi{width:100%;padding:10px 12px;background:rgba(255,255,255,.02);border:1px solid var(--b,#1c1c19);border-radius:10px;color:var(--t,#eae6de);font-size:13px;font-family:'Inter',sans-serif;outline:none;transition:.2s}
        .fi:focus{border-color:var(--goldD,#c9a832);box-shadow:0 0 8px rgba(240,200,80,.1)}
        .fi::placeholder{color:var(--td,#5a5650)}
        .asw{text-align:center;margin-top:16px;font-size:11px;color:var(--tm,#908a7e)}
        .asw a{color:var(--gold,#f0c850);text-decoration:none;font-weight:700;cursor:pointer}
        .auth-submit{background:linear-gradient(135deg,#f0c850 0%,#ffd966 40%,#ffe47a 50%,#ffd966 60%,#f0c850 100%);background-size:200% 200%;animation:shimmer 3s ease-in-out infinite;color:#0a0a08;border:none;padding:12px 0;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;transition:all .25s;font-family:'Inter',sans-serif;box-shadow:0 2px 10px rgba(240,200,80,.12);text-align:center;width:100%;margin-top:4px}
        .auth-submit:hover{transform:translateY(-1px);box-shadow:0 4px 18px rgba(240,200,80,.4)}
        .toast-el{position:fixed;bottom:24px;right:24px;z-index:300;background:#151513;border:1px solid var(--bl,#28281f);border-radius:11px;padding:11px 16px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500;transform:translateY(100px);opacity:0;transition:all .3s cubic-bezier(.22,1,.36,1);box-shadow:0 8px 24px rgba(0,0,0,.5)}
        .toast-el.show{transform:translateY(0);opacity:1}
        .toast-el.success{border-color:rgba(68,224,122,.3)}.toast-el.success i{color:var(--grn,#44e07a)}
        .toast-el.error{border-color:rgba(255,77,106,.3)}.toast-el.error i{color:var(--red,#ff4d6a)}
        @keyframes shimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes su{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @media(max-width:680px){.nav-links .hide-mobile{display:none}.nav-divider{display:none}}
      `}</style>

      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">Trade<span>Off</span></Link>
          <div className="nav-links">
            <Link href="/" className={isHome ? 'active' : ''}>Home</Link>
            <Link href="/browse" className={isBrowse ? 'active' : ''}>Coupons</Link>
            <div className="nav-divider hide-mobile" />
            <Link href="/dashboard/seller" className={pathname === '/dashboard/seller' ? 'active' : ''} style={{ fontSize: 12 }}>
              <i className="fa-solid fa-store" style={{ marginRight: 4, fontSize: 10 }} />Sell
            </Link>
            <Link href="/dashboard/buyer" className={pathname === '/dashboard/buyer' ? 'active' : ''} style={{ fontSize: 12 }}>
              <i className="fa-solid fa-bag-shopping" style={{ marginRight: 4, fontSize: 10 }} />My Codes
            </Link>
            <div className="nav-divider hide-mobile" />
            <button onClick={() => openAuth('signin')}>Sign In</button>
            <Link href="#" className="nav-gold" onClick={e => { e.preventDefault(); openAuth('signup'); }}>
              <i className="fa-solid fa-plus" style={{ fontSize: 9 }} /> Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* AUTH MODAL */}
      <div className={`modal-overlay${authModal ? ' show' : ''}`} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
        <div className="modal">
          <div className="modal-hdr"><div /><button className="modal-close" onClick={closeModal}><i className="fa-solid fa-xmark" /></button></div>
          <div className="modal-body">
            {authMode === 'signin' ? (
              <>
                <h2>Welcome Back</h2>
                <p className="asub">Sign in to your TradeOff account</p>
                <div className="fg"><label>Email</label><input type="email" className="fi" placeholder="you@example.com" id="nav-signin-email" /></div>
                <div className="fg"><label>Password</label><input type="password" className="fi" placeholder="********" id="nav-signin-pass" /></div>
                <button className="auth-submit" onClick={() => doAuth('signin')}>Sign In</button>
                <p className="asw">Don&apos;t have an account? <a onClick={() => setAuthMode('signup')}>Create one</a></p>
              </>
            ) : (
              <>
                <h2>Create Account</h2>
                <p className="asub">Start buying &amp; selling coupons today</p>
                <div className="fg"><label>Email</label><input type="email" className="fi" placeholder="you@example.com" id="nav-signup-email" /></div>
                <div className="fg"><label>Password</label><input type="password" className="fi" placeholder="Min 8 characters" id="nav-signup-pass" /></div>
                <div className="fg"><label>Confirm Password</label><input type="password" className="fi" placeholder="********" id="nav-signup-passc" /></div>
                <button className="auth-submit" onClick={() => doAuth('signup')}>Create Account</button>
                <p className="asw">Already have an account? <a onClick={() => setAuthMode('signin')}>Sign in</a></p>
              </>
            )}
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
