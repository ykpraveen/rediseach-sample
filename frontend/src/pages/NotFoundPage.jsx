import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
      <p className="text-6xl">🎬</p>
      <h1 className="text-3xl font-bold">404 — Page Not Found</h1>
      <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
      <Button asChild>
        <Link to="/">Back to Search</Link>
      </Button>
    </div>
  );
}
