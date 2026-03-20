import { getPortfolioSnapshot } from '@/lib/portfolio';
import ContactClient from './ContactClient';

export default async function ContactPage() {
  const portfolio = await getPortfolioSnapshot();
  return <ContactClient portfolio={portfolio} />;
}
