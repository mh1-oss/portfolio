import { getPortfolioSnapshot } from '@/lib/portfolio';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const portfolio = await getPortfolioSnapshot();
  return <HomeClient portfolio={portfolio} />;
}
