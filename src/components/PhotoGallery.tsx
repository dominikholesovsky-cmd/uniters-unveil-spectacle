import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";

interface PhotoGalleryProps {
  language: "cs" | "en";
}

const PhotoGallery = ({ language }: PhotoGalleryProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const content = {
    cs: {
      title: "Místo konání",
      subtitle: "Podívejte se na místo konání akce",
    },
    en: {
      title: "Event Venue",
      subtitle: "Take a look at the event venue",
    },
  };

  const t = content[language];

  // Placeholder obrázky - nahraďte skutečnými fotkami
  const images = [
    {
      url: "https://images.unsplash.com/photo-1464207687429-7505649dae38?auto=format&fit=crop&w=1200&q=80",
      alt: "Water reservoir exterior view",
    },
    {
      url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
      alt: "Historic water tanks",
    },
    {
      url: "https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?auto=format&fit=crop&w=1200&q=80",
      alt: "Evening ambience",
    },
    {
      url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
      alt: "Event venue interior",
    },
  ];

  // Sledování aktuálního slidu
  useState(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  });

  return (
    <section id="gallery" className="py-12 sm:py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Nadpis */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-4">
              {t.title}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">{t.subtitle}</p>
          </div>

          {/* Carousel */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <Card className="overflow-hidden border-0 shadow-elegant">
                      <div className="aspect-video w-full relative bg-muted">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 sm:left-8 bg-white/90 hover:bg-white text-foreground border-border" />
              <CarouselNext className="right-4 sm:right-8 bg-white/90 hover:bg-white text-foreground border-border" />
            </Carousel>

            {/* Indikátory (dots) */}
            <div className="flex justify-center gap-2 mt-6">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    current === index
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Přejít na obrázek ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhotoGallery;
