import { getPortfolioSnapshot } from '@/lib/portfolio';
import CvClient from './CvClient';

export default async function CvPage() {
  const portfolio = await getPortfolioSnapshot();
  return <CvClient data={portfolio} />;
}
