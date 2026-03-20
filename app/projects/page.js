import { getPortfolioSnapshot } from '@/lib/portfolio';
import ProjectsClient from './ProjectsClient';

export default async function ProjectsPage() {
  const portfolio = await getPortfolioSnapshot();
  return <ProjectsClient portfolio={portfolio} />;
}
