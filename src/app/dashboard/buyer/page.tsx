import BuyerDashboardClient from '@/components/BuyerDashboardClient';

export const metadata = {
  title: 'My Purchases — TradeOff',
  description: 'View your purchased coupons and revealed codes.',
};

export default function BuyerDashboard() {
  return <BuyerDashboardClient userId="demo" userName="Demo Buyer" />;
}
