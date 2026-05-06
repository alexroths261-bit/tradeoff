import SellerDashboardClient from '@/components/SellerDashboardClient';

export const metadata = {
  title: 'Seller Dashboard — TradeOff',
  description: 'List and manage your discount coupons.',
};

export default function SellerDashboard() {
  return <SellerDashboardClient userId="demo" userName="Demo Seller" />;
}
