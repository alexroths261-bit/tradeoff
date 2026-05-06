import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  let where = `c.status = 'active' AND c.expiry_date > NOW()`;
  const params: any[] = [];

  if (category !== 'all') {
    where += ` AND c.category = ${category}`;
  }

  if (search) {
    where += ` AND (c.brand ILIKE ${'%' + search + '%'} OR c.description ILIKE ${'%' + search + '%'})`;
  }

  if (minPrice) {
    where += ` AND c.listing_price >= ${Number(minPrice)}`;
  }

  if (maxPrice) {
    where += ` AND c.listing_price <= ${Number(maxPrice)}`;
  }

  let orderBy = 'c.created_at DESC';
  if (sort === 'price_low') orderBy = 'c.listing_price ASC';
  if (sort === 'price_high') orderBy = 'c.listing_price DESC';
  if (sort === 'discount') orderBy = '((c.original_value - c.listing_price) / c.original_value) DESC';
  if (sort === 'expiry') orderBy = 'c.expiry_date ASC';

  try {
    const coupons = await sql`
      SELECT
        c.id, c.brand, c.category, c.description, c.original_value,
        c.listing_price, c.expiry_date, c.status, c.created_at,
        u.name as seller_name,
        COALESCE(u.rating, 0)::float as seller_rating,
        COALESCE(u.total_reviews, 0) as seller_reviews
      FROM coupons c
      JOIN users u ON c.seller_id = u.id
      WHERE ${sql.raw(where)}
      ORDER BY ${sql.raw(orderBy)}
      LIMIT 50
    `;

    return NextResponse.json({ coupons });
  } catch (error: any) {
    console.error('Coupons fetch error:', error.message);
    return NextResponse.json({ coupons: [] }, { status: 200 });
  }
}
