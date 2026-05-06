import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { decryptCode } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, couponId } = await req.json();

    if (!couponId) {
      return NextResponse.json({ error: 'Missing couponId' }, { status: 400 });
    }

    // Check if user is authenticated via session cookie
    // For now we rely on the client passing couponId

    // Verify Razorpay signature if real payment
    if (razorpay_signature && process.env.RAZORPAY_KEY_SECRET) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSig = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSig !== razorpay_signature) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
      }
    }

    // Fetch the coupon
    const coupons = await sql`
      SELECT id, seller_id, encrypted_code, status FROM coupons 
      WHERE id = ${couponId}
    `;

    if (coupons.length === 0) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    const coupon = coupons[0];

    if (coupon.status !== 'active') {
      return NextResponse.json({ error: 'Coupon no longer available' }, { status: 410 });
    }

    // Decrypt the coupon code server-side
    const code = decryptCode(coupon.encrypted_code);

    // Mark coupon as sold
    await sql`
      UPDATE coupons SET status = 'sold', updated_at = NOW() 
      WHERE id = ${couponId}
    `;

    // Create purchase record (buyer_id will be set from session in production)
    await sql`
      INSERT INTO purchases (buyer_id, coupon_id, razorpay_payment_id, razorpay_order_id, amount_paid, status)
      VALUES (1, ${couponId}, ${razorpay_payment_id || 'demo'}, ${razorpay_order_id || 'demo'}, 0, 'completed')
    `;

    return NextResponse.json({ code });
  } catch (err: any) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
