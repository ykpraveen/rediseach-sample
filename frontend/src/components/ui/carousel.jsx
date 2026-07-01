import { useCallback, useEffect, useState, createContext, useContext } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const CarouselContext = createContext(null);

function useCarousel() {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error('useCarousel must be used within <Carousel>');
  return ctx;
}

function Carousel({ children, className, opts }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', ...opts });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <CarouselContext.Provider value={{ emblaApi, emblaRef, canScrollPrev, canScrollNext }}>
      <div className={cn('relative', className)}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ children, className }) {
  const { emblaRef } = useCarousel();
  return (
    <div ref={emblaRef} className="overflow-hidden">
      <div className={cn('flex', className)}>
        {children}
      </div>
    </div>
  );
}

function CarouselItem({ children, className }) {
  return (
    <div className={cn('min-w-0 shrink-0 grow-0 basis-full', className)}>
      {children}
    </div>
  );
}

function CarouselPrevious({ className }) {
  const { emblaApi, canScrollPrev } = useCarousel();
  return (
    <Button
      variant="outline"
      size="icon"
      disabled={!canScrollPrev}
      onClick={() => emblaApi?.scrollPrev()}
      className={cn(
        'absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full size-8 bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <ChevronLeft className="size-4" />
    </Button>
  );
}

function CarouselNext({ className }) {
  const { emblaApi, canScrollNext } = useCarousel();
  return (
    <Button
      variant="outline"
      size="icon"
      disabled={!canScrollNext}
      onClick={() => emblaApi?.scrollNext()}
      className={cn(
        'absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full size-8 bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <ChevronRight className="size-4" />
    </Button>
  );
}

function CarouselDots({ className }) {
  const { emblaApi } = useCarousel();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  if (scrollSnaps.length <= 1) return null;

  return (
    <div className={cn('flex justify-center gap-1.5 pt-3', className)}>
      {scrollSnaps.map((_, i) => (
        <button
          key={i}
          onClick={() => emblaApi?.scrollTo(i)}
          className={cn(
            'size-2 rounded-full transition-all',
            i === selectedIndex
              ? 'bg-primary w-5'
              : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
          )}
        />
      ))}
    </div>
  );
}

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots };
