import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  let orderBy = 'c.created_at DESC';
  if (sort === 'price_low') orderBy = 'c.listing_price ASC';
  if (sort === 'price_high') orderBy = 'c.listing_price DESC';
  if (sort === 'discount') orderBy = '((c.original_value - c.listing_price) / c.original_value) DESC';
  if (sort === 'expiry') orderBy = 'c.expiry_date ASC';

  const validCats = ['food', 'travel', 'fashion', 'grocery', 'electronics'];
  const safeCat = validCats.includes(category) ? category : 'all';
  const safeSearch = search.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 100);
  const safeMin = minPrice && !isNaN(Number(minPrice)) ? Number(minPrice) : null;
  const safeMax = maxPrice && !isNaN(Number(maxPrice)) ? Number(maxPrice) : null;
  const validOrders = ['c.created_at DESC', 'c.created_at ASC', 'c.listing_price ASC', 'c.listing_price DESC', '((c.original_value - c.listing_price) / c.original_value) DESC', '((c.original_value - c.listing_price) / c.original_value) ASC', 'c.expiry_date ASC', 'c.expiry_date DESC'];
  const safeOrder = validOrders.includes(orderBy) ? orderBy : 'c.created_at DESC';

  let whereParts: string[] = ["c.status = 'active'", "c.expiry_date > NOW()"];
  if (safeCat !== 'all') whereParts.push(`c.category = '${safeCat}'`);
  if (safeSearch) whereParts.push(`(c.brand ILIKE '%${safeSearch}%' OR c.description ILIKE '%${safeSearch}%')`);
  if (safeMin !== null) whereParts.push(`c.listing_price >= ${safeMin}`);
  if (safeMax !== null) whereParts.push(`c.listing_price <= ${safeMax}`);

  const whereStr = whereParts.join(' AND ');

  try {
    const coupons = await sql.unsafe(
      `SELECT c.id, c.brand, c.category, c.description, c.original_value, c.listing_price, c.expiry_date, c.status, c.created_at, u.name as seller_name, COALESCE(u.rating, 0)::float as seller_rating, COALESCE(u.total_reviews, 0) as seller_reviews FROM coupons c JOIN users u ON c.seller_id = u.id WHERE ${whereStr} ORDER BY ${safeOrder} LIMIT 50`
    );

    return NextResponse.json({ coupons });
  } catch (error: any) {
    console.error('Coupons fetch error:', error.message);
    return NextResponse.json({ coupons: [] }, { status: 200 });
  }
}
