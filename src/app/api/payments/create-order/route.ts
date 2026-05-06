import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { couponId, amount } = await req.json();

    if (!couponId || !amount) {
      return NextResponse.json({ error: 'Missing couponId or amount' }, { status: 400 });
    }

    // Check coupon is still active and not expired
    const coupons = await sql`
      SELECT id, status, expiry_date FROM coupons 
      WHERE id = ${couponId} AND status = 'active' AND expiry_date > NOW()
    `;

    if (coupons.length === 0) {
      return NextResponse.json({ error: 'Coupon not available' }, { status: 404 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: `tradeoff_${couponId}_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: amount * 100,
      currency: 'INR',
    });
  } catch (err: any) {
    // If Razorpay keys not set, return demo mode signal
    if (err.message?.includes('key_id') || err.message?.includes('key_secret')) {
      return NextResponse.json({ demo: true, amount: amount * 100 });
    }
    return NextResponse.json({ error: 'Payment init failed' }, { status: 500 });
  }
}
