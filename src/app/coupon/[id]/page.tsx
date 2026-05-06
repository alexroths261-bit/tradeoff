import CouponDetailClient from '@/components/CouponDetailClient';
import { notFound } from 'next/navigation';

const FALLBACK: Record<string, any> = {
  '1': { id: 1, brand: 'MakeMyTrip', cat: 'travel', desc: 'Flat ₹2000 off on domestic flight bookings. Valid on bookings above ₹5000. One use per user. Applicable on all airlines.', price: 799, original: 2000, expiry: '2026-05-30', rating: 4.8, reviews: 124, sellerName: 'Rahul K.', sellerId: 'u1', wishlistCount: 23, createdAt: '2026-01-15' },
  '2': { id: 2, brand: 'Blinkit', cat: 'grocery', desc: 'Get 70% off on your first grocery order above ₹199. Maximum discount ₹150. Valid on all categories including fruits, vegetables, dairy.', price: 30, original: 150, expiry: '2026-03-05', rating: 4.5, reviews: 89, sellerName: 'Priya S.', sellerId: 'u2', wishlistCount: 45, createdAt: '2026-01-20' },
  '3': { id: 3, brand: 'Myntra', cat: 'fashion', desc: 'Flat ₹500 off on fashion orders above ₹1999. Applicable on all brands including Nike, Puma, Levi\'s, H&M. Limited period offer.', price: 99, original: 500, expiry: '2026-03-10', rating: 4.7, reviews: 203, sellerName: 'Amit M.', sellerId: 'u3', wishlistCount: 67, createdAt: '2026-01-22' },
  '4': { id: 4, brand: 'Swiggy', cat: 'food', desc: '50% off for new users on orders above ₹150. Maximum discount ₹100. Valid on all restaurants. No minimum delivery fee.', price: 1, original: 100, expiry: '2026-05-01', rating: 4.9, reviews: 456, sellerName: 'Neha R.', sellerId: 'u4', wishlistCount: 112, createdAt: '2026-01-25' },
  '5': { id: 5, brand: 'Ajio', cat: 'fashion', desc: 'Extra 50% off on ajio.com. Valid on selected styles across all brands. No minimum order value. Applicable on app and web.', price: 449, original: 1200, expiry: '2026-04-15', rating: 4.3, reviews: 67, sellerName: 'Vikram D.', sellerId: 'u5', wishlistCount: 18, createdAt: '2026-02-01' },
  '6': { id: 6, brand: 'Uber Eats', cat: 'food', desc: '20% off up to ₹75 on your next 3 orders. Minimum order ₹199. Valid on all restaurant partners in metro cities.', price: 25, original: 225, expiry: '2026-06-15', rating: 4.6, reviews: 178, sellerName: 'Sana K.', sellerId: 'u6', wishlistCount: 34, createdAt: '2026-02-05' },
  '7': { id: 7, brand: 'Goibibo', cat: 'travel', desc: 'Flat ₹1500 off on hotel bookings above ₹4000. Pan India. Select properties including 3-star, 4-star, and 5-star hotels.', price: 550, original: 1500, expiry: '2026-04-22', rating: 4.4, reviews: 92, sellerName: 'Deepak T.', sellerId: 'u7', wishlistCount: 29, createdAt: '2026-02-08' },
  '8': { id: 8, brand: 'Croma', cat: 'electronics', desc: '20% off on electronics & accessories. Max discount ₹3000. Orders above ₹5000. Valid on laptops, phones, TVs, and more.', price: 299, original: 3000, expiry: '2026-07-01', rating: 4.2, reviews: 54, sellerName: 'Ritu P.', sellerId: 'u8', wishlistCount: 12, createdAt: '2026-02-10' },
  '9': { id: 9, brand: 'Zomato', cat: 'food', desc: 'Flat ₹80 off on food orders above ₹249. Valid once per user. All restaurants including Gold partners. No extra fees.', price: 15, original: 80, expiry: '2026-05-20', rating: 4.7, reviews: 312, sellerName: 'Karan J.', sellerId: 'u9', wishlistCount: 89, createdAt: '2026-02-12' },
  '10': { id: 10, brand: 'Flipkart', cat: 'electronics', desc: '₹1000 off on electronics above ₹10000. SBI & HDFC credit card users only. Includes smartphones, laptops, tablets.', price: 199, original: 1000, expiry: '2026-06-30', rating: 4.5, reviews: 245, sellerName: 'Anita G.', sellerId: 'u10', wishlistCount: 156, createdAt: '2026-02-14' },
  '11': { id: 11, brand: 'Nykaa', cat: 'fashion', desc: '25% off on beauty & personal care. Min order ₹800. All brands included — Lakme, Maybelline, MAC, Bobbi Brown, and more.', price: 149, original: 500, expiry: '2026-04-15', rating: 4.6, reviews: 134, sellerName: 'Meera V.', sellerId: 'u11', wishlistCount: 41, createdAt: '2026-02-16' },
  '12': { id: 12, brand: 'BigBasket', cat: 'grocery', desc: 'Flat ₹200 off on grocery orders above ₹1000. First order only. All categories — fresh produce, staples, snacks, beverages.', price: 49, original: 200, expiry: '2026-05-10', rating: 4.3, reviews: 78, sellerName: 'Arjun B.', sellerId: 'u12', wishlistCount: 22, createdAt: '2026-02-18' },
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const coupon = FALLBACK[params.id];
  if (!coupon) return { title: 'Coupon Not Found — TradeOff' };
  return {
    title: `${coupon.brand} Coupon — TradeOff`,
    description: coupon.desc,
  };
}

export default async function CouponPage({ params }: { params: { id: string } }) {
  const coupon = FALLBACK[params.id];
  if (!coupon) notFound();

  return <CouponDetailClient coupon={coupon} />;
}
