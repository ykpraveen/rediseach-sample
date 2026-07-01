import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Pagination({ offset, limit, total, onPageChange }) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  function goTo(page) {
    onPageChange((page - 1) * limit);
  }

  return (
    <nav className="flex items-center justify-center gap-1 pt-6 animate-in fade-in duration-300" aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => goTo(currentPage - 1)}
        aria-label="Previous page"
        className="transition-all duration-200"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {start > 1 && (
        <>
          <Button variant="outline" size="sm" onClick={() => goTo(1)} className="transition-all duration-200">1</Button>
          {start > 2 && <span className="px-1 text-muted-foreground select-none">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => goTo(page)}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
          className="transition-all duration-200"
        >
          {page}
        </Button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-muted-foreground select-none">...</span>}
          <Button variant="outline" size="sm" onClick={() => goTo(totalPages)} className="transition-all duration-200">
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => goTo(currentPage + 1)}
        aria-label="Next page"
        className="transition-all duration-200"
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}
