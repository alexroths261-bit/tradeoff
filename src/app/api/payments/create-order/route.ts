import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const couponId: string = body.couponId;
    const amount: number = Number(body.amount) || 0;

    if (!couponId || amount <= 0) {
      return NextResponse.json({ error: 'Missing couponId or amount' }, { status: 400 });
    }

    const coupons = await sql`
      SELECT id, status, expiry_date FROM coupons 
      WHERE id = ${couponId} AND status = 'active' AND expiry_date > NOW()
    `;

    if (!coupons || coupons.length === 0) {
      return NextResponse.json({ error: 'Coupon not available' }, { status: 404 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    if (!keyId || !keySecret) {
      return NextResponse.json({ demo: true, amount: amount * 100 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `tradeoff_${couponId}_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: amount * 100,
      currency: 'INR',
    });
  } catch (err: any) {
    console.error('Payment error:', err.message);
    return NextResponse.json({ error: 'Payment init failed' }, { status: 500 });
  }
}
