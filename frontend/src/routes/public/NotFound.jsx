import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { FuzzyText404 } from '../../components/effects/FuzzyText404.jsx';
import { Button } from '../../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
      <FuzzyText404 />
      <h1 className="mt-2 font-fraunces text-h2 text-text-primary">This page got lost in the festivities</h1>
      <p className="mt-2 max-w-md text-body text-text-secondary">
        The page you're looking for doesn't exist or has moved. Let's get you back to the celebration.
      </p>
      <Link to="/" className="mt-8">
        <Button size="lg">
          <Home className="h-4 w-4" />
          Back to home
        </Button>
      </Link>
    </div>
  );
}