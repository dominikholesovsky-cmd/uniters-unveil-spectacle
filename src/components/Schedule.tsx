import { Clock, Info, Music, Gift } from "lucide-react";
import loklokLogo from "@/assets/loklok-logo.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ScheduleProps {
  language: "cs" | "en";
}

const Schedule = ({ language }: ScheduleProps) => {
  const content = {
    cs: {
      title: "Časový harmonogram",
      subtitle: "Program večera",
      schedule: [
        {
          time: "18:00",
          title: "Příchod hostů",
          description: "Vítací drink a začátek smyčcového kvartetu. Rozklikněte pro ukázku hudby.",
          icon: Music,
        },
        {
          time: "18:30",
          title: "První prohlídka vodojemů",
          description: "Soukromá komentovaná prohlídka s průvodcem",
          icon: Info,
        },
        {
          time: "19:00",
          title: "Catering & networking",
          description: "Ochutnávka vín a specialit, networking s hudbou",
          icon: Gift,
        },
        {
          time: "19:30",
          title: "Druhá prohlídka vodojemů",
          description: "Soukromá komentovaná prohlídka s průvodcem",
          icon: Info,
        },
        {
          time: "20:00",
          title: "Volný program",
          description: "Networking, hudba, degustace",
          icon: Music,
        },
      ],
      partner: "S podporou kombucha",
    },
    en: {
      title: "Schedule",
      subtitle: "Evening Program",
      schedule: [
        {
          time: "18:00",
          title: "Guest Arrival",
          description: "Welcome drink and string quartet performance begins. Click to hear a music preview.",
          icon: Music,
        },
        {
          time: "18:30",
          title: "First Tour",
          description: "Private guided tour of the water reservoirs",
          icon: Info,
        },
        {
          time: "19:00",
          title: "Catering & Networking",
          description: "Wine tasting and specialties, networking with music",
          icon: Gift,
        },
        {
          time: "19:30",
          title: "Second Tour",
          description: "Private guided tour of the water reservoirs",
          icon: Info,
        },
        {
          time: "20:00",
          title: "Free Program",
          description: "Networking, music, tasting",
          icon: Music,
        },
      ],
      partner: "Supported by kombucha",
    },
  };

  const t = content[language] ?? content.cs;

  return (
    <section className="py-10 sm:py-12 relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #1a1a1a 0%, #1a1a1a 100%)'
    }}>
      {/* Underground atmosphere layers */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `
          radial-gradient(circle at 60% 40%, rgba(30, 30, 30, 0.8) 0%, transparent 50%),
          radial-gradient(circle at 30% 70%, rgba(30, 30, 30, 0.8) 0%, transparent 50%)
        `
      }} />
      {/* Concrete texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(
          90deg,
          transparent,
          transparent 2px,
          rgba(255, 255, 255, 0.1) 2px,
          rgba(255, 255, 255, 0.1) 4px
        ),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(255, 255, 255, 0.1) 2px,
          rgba(255, 255, 255, 0.1) 4px
        )`
      }} />
      {/* Water tank circles pattern */}
      <div className="absolute inset-0 opacity-[0.05]" style={{
        backgroundImage: `radial-gradient(circle, transparent 40%, rgba(255,255,255,0.1) 41%, transparent 42%),
                          radial-gradient(circle, transparent 40%, rgba(255,255,255,0.1) 41%, transparent 42%)`,
        backgroundSize: '150px 150px',
        backgroundPosition: '0 0, 75px 75px'
      }} />
      {/* Water droplets */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 45% 25%, rgba(100, 150, 200, 0.1) 0%, transparent 3%),
                          radial-gradient(circle at 80% 50%, rgba(100, 150, 200, 0.1) 0%, transparent 2%),
                          radial-gradient(circle at 20% 75%, rgba(100, 150, 200, 0.1) 0%, transparent 2.5%)`
      }} />
      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
      }} />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              {t.title}
            </h2>
            <p className="text-lg sm:text-xl text-white/90">{t.subtitle}</p>
          </div>

          {/* Schedule Timeline */}
          <div className="space-y-6">
            {t.schedule.map((item, index) => (
              index === 0 ? (
                // First item with dropdown
                <Accordion key={index} type="single" collapsible>
                  <AccordionItem value="item-0" className="border-none">
                    <div
                      className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl overflow-hidden hover:bg-white/15 dark:hover:bg-white/10 transition-all duration-300"
                      style={{ animationDelay: '0s' }}
                    >
                      <AccordionTrigger className="p-6 sm:p-8 hover:no-underline [&[data-state=open]>div]:mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full">
                          {/* Time Badge */}
                          <div className="flex items-center gap-3 sm:min-w-[140px]">
                            <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                              <Clock className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl sm:text-3xl font-bold text-white">
                              {item.time}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 flex items-start gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                              <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="space-y-1 text-left">
                              <h3 className="text-lg sm:text-xl font-semibold text-white">
                                {item.title}
                              </h3>
                              <p className="text-sm sm:text-base text-white/80">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-6 sm:px-8 pb-6 sm:pb-8">
                        <div className="mt-4 rounded-lg overflow-hidden bg-black/20">
                          <div className="aspect-video">
                            <iframe
                              className="w-full h-full"
                              src="https://www.youtube.com/embed/XqElpYoTSMk?si=5DbWRCyE6B1tmg-p"
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </div>
                  </AccordionItem>
                </Accordion>
              ) : (
                // Regular items without dropdown
                <div
                  key={index}
                  className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:bg-white/15 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    {/* Time Badge */}
                    <div className="flex items-center gap-3 sm:min-w-[140px]">
                      <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-2xl sm:text-3xl font-bold text-white">
                        {item.time}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex items-start gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-white">{item.title}</h3>
                        <p className="text-sm sm:text-base text-white/80">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Partner Badge */}
          <div className="mt-12 text-center">
            <a
              href="https://loklok.cz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30 transition-all duration-300 hover:bg-white/15 hover:-translate-y-1"
            >
              <span className="text-sm sm:text-base font-medium text-white">{t.partner}</span>
              <img
                src={loklokLogo}
                alt="LokLok"
                className="h-6 sm:h-8 w-auto brightness-0 invert"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Schedule;
