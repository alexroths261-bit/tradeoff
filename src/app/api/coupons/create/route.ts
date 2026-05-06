import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import CryptoJS from 'crypto-js';

const ENCRYPT_KEY = process.env.ENCRYPT_KEY || 'tradeoff-default-key-32chars!!';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { brand, category, description, couponCode, originalValue, listingPrice, expiryDate } = body;

    if (!brand || !category || !description || !couponCode || !originalValue || !listingPrice || !expiryDate) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (listingPrice >= originalValue) {
      return NextResponse.json({ error: 'Listing price must be less than original value' }, { status: 400 });
    }

    if (new Date(expiryDate) <= new Date()) {
      return NextResponse.json({ error: 'Expiry date must be in the future' }, { status: 400 });
    }

    const encryptedCode = CryptoJS.AES.encrypt(couponCode, ENCRYPT_KEY).toString();

    const result = await sql`
      INSERT INTO coupons (seller_id, brand, category, description, coupon_code_encrypted, original_value, listing_price, expiry_date, status)
      VALUES (${session.user.id}, ${brand}, ${category}, ${description}, ${encryptedCode}, ${originalValue}, ${listingPrice}, ${expiryDate}::timestamptz, 'active')
      RETURNING id, brand, category, listing_price, original_value, expiry_date, status, created_at
    `;

    return NextResponse.json({ coupon: result[0], message: 'Coupon listed successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Create coupon error:', error.message);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
