import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Navigation, Calendar } from "lucide-react";

const POWER_AUTOMATE_SUBMIT_URL =
  "https://default54b8b3209661409e9b3e7fc3e0adae.a5.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/7e4728fa129c4a869c877437c791fcea/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Ae_Ysv7Bovz-dFpy-KNXpk5dRI8nM_HBi6WYL46drPA";

interface RegistrationFormProps {
  language: "cs" | "en";
}

const RegistrationForm = ({ language }: RegistrationFormProps) => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // kontrola localStorage při načtení komponenty
  useEffect(() => {
    const submitted = localStorage.getItem("registrationSubmitted") === "true";
    setIsSubmitted(submitted);
  }, []);

  const content = {
    cs: {
      title: "Registrace",
      subtitle: "Zarezervujte si místo na akci a komentované prohlídce",
      name: "Jméno a příjmení",
      namePlaceholder: "Jan Novák",
      email: "E-mail",
      emailPlaceholder: "jan.novak@example.com",
      phone: "Telefon",
      phonePlaceholder: "+420 123 456 789",
      guidedTour: "Mám zájem o komentovanou prohlídku v 18:30",
      guidedTourNote:
        "Doporučujeme se zúčastnit, komentovaná prohlídka je omezená kapacitou.",
      gdprConsent:
        "Souhlasím se zpracováním osobních údajů pro účely registrace.",
      photoVideoConsent:
        "Souhlasím s pořizováním fotografií a videí během akce pro marketingové účely společnosti Uniters.",
      submit: "Potvrdit registraci",
      successTitle: "Registrace potvrzena!",
      successMessage:
        "Děkujeme za registraci. Těšíme se na vás 22. ledna 2026.",
      company: "Firma",
      companyPlaceholder: "Název firmy",
      openNavigation: "Otevřít navigaci",
      addToCalendar: "Přidat do kalendáře",
      alreadySubmitted: "Už jste se zaregistrovali. Nemůžete odeslat formulář znovu.",
    },
    en: {
      title: "Registration",
      subtitle: "Reserve your spot at the event and tour",
      name: "Full Name",
      namePlaceholder: "John Doe",
      email: "Email",
      emailPlaceholder: "john.doe@example.com",
      phone: "Phone",
      phonePlaceholder: "+420 123 456 789",
      guidedTour: "I am interested in a guided tour at 6:30 PM",
      guidedTourNote:
        "We recommend attending, guided tour is limited in capacity.",
      gdprConsent:
        "I agree to the processing of my personal data for registration purposes.",
      photoVideoConsent:
        "I agree to photo and video recording during the event for marketing purposes of Uniters.",
      submit: "Confirm Registration",
      successTitle: "Registration Confirmed!",
      successMessage:
        "Thank you for registering. We look forward to seeing you on January 22, 2026.",
      company: "Company",
      companyPlaceholder: "Company Name",
      openNavigation: "Open Navigation",
      addToCalendar: "Add to Calendar",
      alreadySubmitted: "You have already registered. You cannot submit again.",
    },
  };

  const t = content[language];

  const formSchema = z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    phone: z.string().trim().max(20).optional(),
    company: z.string().trim().min(1),
    guidedTour: z.boolean().optional(),
    gdprConsent: z.literal(true),
    photoVideoConsent: z.literal(true),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      guidedTour: false,
      gdprConsent: undefined as any,
      photoVideoConsent: undefined as any,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch(POWER_AUTOMATE_SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          guidedTour: values.guidedTour ? "yes" : "no",
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to send data");

      localStorage.setItem("registrationSubmitted", "true");
      setIsSubmitted(true);

      toast({
        title: t.successTitle,
        description: t.successMessage,
        className: "bg-white text-black shadow-xl rounded-2xl",
      });

      const element = document.getElementById("registration-form");
      if (element) element.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      toast({
        title: language === "cs" ? "Chyba při odesílání" : "Error sending data",
        description:
          language === "cs"
            ? "Nepodařilo se odeslat registraci. Zkuste to prosím znovu."
            : "Failed to send registration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNavigationClick = () => {
    const coordinates = "49.1956718,16.5913221";
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${coordinates}`,
      "_blank"
    );
  };

  const handleAddToCalendar = () => {
    const uid = `uniters-event-${Date.now()}@example.com`;
    const dtstamp =
      new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Uniters//Event//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART;TZID=Europe/Prague:20260122T18:00:00
DTEND;TZID=Europe/Prague:20260122T22:00:00
SUMMARY:Uniters Event
DESCRIPTION:Vodojemy Žlutý Kopec
LOCATION:Vodojemy Žlutý Kopec, Brno
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "uniters-event.ics";
    a.click();
  };

  if (isSubmitted) {
    return (
      <section className="py-12 sm:py-16 bg-gradient-to-b from-background via-background-light to-background-light">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl p-10 shadow-xl">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">{t.successTitle}</h2>
            <p className="text-lg mb-6">{t.successMessage}</p>
            <p className="text-sm text-gray-500 mb-4">{t.alreadySubmitted}</p>
            <div className="flex justify-center gap-4">
              <Button onClick={handleNavigationClick}>
                <Navigation className="w-5 h-5 mr-2" /> {t.openNavigation}
              </Button>
              <Button onClick={handleAddToCalendar}>
                <Calendar className="w-5 h-5 mr-2" /> {t.addToCalendar}
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="registration-form"
      className="py-10 bg-gradient-to-b from-background via-background-light to-background-light"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-10 shadow-xl">
          <h2 className="text-4xl font-bold text-center mb-4">{t.title}</h2>
          <p className="text-center text-gray-600 mb-8">{t.subtitle}</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {["name", "email", "phone", "company"].map((fieldName) => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={fieldName as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t[fieldName as keyof typeof t]}{" "}
                        {["name", "email", "company"].includes(fieldName) && (
                          <span className="text-red-500">*</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t[
                            `${fieldName}Placeholder` as keyof typeof t
                          ]}
                          className="bg-white text-black border-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              {/* Guided tour */}
              <FormField
                control={form.control}
                name="guidedTour"
                render={({ field }) => (
                  <FormItem className="p-4 border-2 border-blue-500 rounded-xl bg-blue-50 flex items-center gap-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(v) => field.onChange(!!v)}
                      />
                    </FormControl>
                    <div className="flex flex-col m-0">
                      <FormLabel className="font-semibold text-blue-700 m-0">
                        {t.guidedTour}
                      </FormLabel>
                      <p className="text-sm text-blue-600 mt-1 m-0">{t.guidedTourNote}</p>
                    </div>
                  </FormItem>
                )}
              />

              {/* GDPR */}
              <FormField
                control={form.control}
                name="gdprConsent"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(v) => field.onChange(!!v)}
                      />
                    </FormControl>
                    <FormLabel>
                      <span className="text-red-500">*</span> {t.gdprConsent}
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Photo/Video consent */}
              <FormField
                control={form.control}
                name="photoVideoConsent"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(v) => field.onChange(!!v)}
                      />
                    </FormControl>
                    <FormLabel>
                      <span className="text-red-500">*</span> {t.photoVideoConsent}
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full text-lg h-14">
                {t.submit}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default RegistrationForm;
