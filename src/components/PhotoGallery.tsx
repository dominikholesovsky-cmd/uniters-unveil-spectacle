import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import VODOJEM1 from "@/assets/VODOJEM1.jpg";
import VODOJEM2 from "@/assets/VODOJEM2.jpg";
import VODOJEM3 from "@/assets/VODOJEM3.jpg";
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

  // Obrázky
  const images = [
    { src: VODOJEM1, alt: "Water reservoir exterior view" },
    { src: VODOJEM2, alt: "Historic water tanks" },
    { src: VODOJEM3, alt: "Evening ambience" },
  ];

  // Sledování aktuálního slidu
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section id="gallery" className="py-12 sm:py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Nadpis */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-4">
              {t.title}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              {language === "cs" ? (
                <>
                  Podívejte se na{" "}
                  <a
                    href="https://vodojemybrno.cz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline decoration-2 underline-offset-4 hover:decoration-primary/80 font-medium transition-colors"
                  >
                    místo konání akce
                  </a>
                </>
              ) : (
                <>
                  Take a look at the{" "}
                  <a
                    href="https://vodojemybrno.cz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline decoration-2 underline-offset-4 hover:decoration-primary/80 font-medium transition-colors"
                  >
                    event venue
                  </a>
                </>
              )}
            </p>
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
                          src={image.src}
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
