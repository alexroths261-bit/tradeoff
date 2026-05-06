import { sql } from '@/lib/db';
import LandingClient from '@/components/LandingClient';

async function getCoupons() {
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
      WHERE c.status = 'active' AND c.expiry_date > NOW()
      ORDER BY c.created_at DESC
    `;

    if (coupons.length === 0) throw new Error('empty');

    return coupons.map((c: any) => ({
      id: c.id,
      brand: c.brand,
      initials: c.brand.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase(),
      cat: c.category,
      discount: c.description.split('—')[0]?.trim() || `${Math.round((1 - c.listing_price / c.original_value) * 100)}% OFF`,
      desc: c.description,
      price: c.listing_price,
      original: c.original_value,
      expiry: c.expiry_date,
      rating: Number(c.seller_rating) || 4.5,
      reviews: c.seller_reviews || 0,
      sellerName: c.seller_name,
      featured: false,
    }));
  } catch {
    return [
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
  }
}

export default async function Home() {
  const coupons = await getCoupons();

  return (
    <main>
      <LandingClient coupons={coupons} />
    </main>
  );
}
