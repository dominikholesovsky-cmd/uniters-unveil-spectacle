import { Clock, Info, Music, Gift } from "lucide-react";
import loklokLogo from "@/assets/loklok-logo.png";

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
          description: "Vítací drink a začátek smyčcového kvartetu",
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
          description: "Welcome drink and string quartet performance begins",
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
    <section className="py-10 sm:py-12 bg-gradient-to-b from-background via-background-light to-background-light">
      <div className="container mx-auto px-4">
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
            ))}
          </div>

          {/* Partner Badge */}
          <div className="mt-12 text-center">
            <a
              href="https://loklok.com" // replace with real link
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
