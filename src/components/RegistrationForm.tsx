import { useState } from "react";
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
import { CheckCircle2, Navigation } from "lucide-react";
import TermsModal from "./TermsModal";

const POWER_AUTOMATE_URL =
  "https://default54b8b3209661409e9b3e7fc3e0adae.a5.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/7e4728fa129c4a869c877437c791fcea/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Ae_Ysv7Bovz-dFpy-KNXpk5dRI8nM_HBi6WYL46drPA";

interface RegistrationFormProps {
  language: "cs" | "en";
}

const RegistrationForm = ({ language }: RegistrationFormProps) => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPlusOneDetails, setShowPlusOneDetails] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);

  const content = {
    cs: {
      title: "Registrace",
      subtitle: "Zarezervujte si místo na akci",
      name: "Jméno a příjmení",
      namePlaceholder: "Jan Novák",
      email: "E-mail",
      emailPlaceholder: "jan.novak@example.com",
      phone: "Telefon",
      phonePlaceholder: "+420 123 456 789",
      plusOne: "Účast s doprovodem",
      guestName: "Jméno doprovodu",
      guestNamePlaceholder: "Jméno osoby +1",
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
    },
    en: {
      title: "Registration",
      subtitle: "Reserve your spot at the event",
      name: "Full Name",
      namePlaceholder: "John Doe",
      email: "Email",
      emailPlaceholder: "john.doe@example.com",
      phone: "Phone",
      phonePlaceholder: "+420 123 456 789",
      plusOne: "Attending with guest",
      guestName: "Guest Name",
      guestNamePlaceholder: "Name of +1 person",
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
    },
  };

  const t = content[language];

  const formSchema = z
    .object({
      name: z.string().trim().min(2, {
        message:
          language === "cs"
            ? "Jméno musí mít alespoň 2 znaky"
            : "Name must be at least 2 characters",
      }),
      email: z.string().trim().email({
        message:
          language === "cs"
            ? "Neplatná e-mailová adresa"
            : "Invalid email address",
      }),
      phone: z.string().trim().max(20).optional(),
      company: z.string().trim().min(1, {
        message:
          language === "cs" ? "Zadejte název firmy" : "Please enter company name",
      }),
      plusOne: z.boolean().default(false),
      guestName: z.string().trim().max(100).optional(),
      gdprConsent: z.literal(true, {
        errorMap: () => ({
          message:
            language === "cs"
              ? "Musíte souhlasit se zpracováním osobních údajů"
              : "You must agree to the processing of personal data",
        }),
      }),
      photoVideoConsent: z.literal(true, {
        errorMap: () => ({
          message:
            language === "cs"
              ? "Musíte souhlasit s pořizováním fotografií a videí"
              : "You must agree to photo and video recording",
        }),
      }),
    })
    .refine(
      (data) => !data.plusOne || (data.plusOne && data.guestName?.trim().length > 0),
      {
        message:
          language === "cs"
            ? "Zadejte prosím jméno doprovodu"
            : "Please enter guest name",
        path: ["guestName"],
      }
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      plusOne: false,
      guestName: "",
      gdprConsent: undefined as any,
      photoVideoConsent: undefined as any,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    localStorage.setItem("gdprConsent", "accepted");

    try {
      const response = await fetch(POWER_AUTOMATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          company: values.company,
          plusOne: values.plusOne,
          guestName: values.guestName || "",
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to send data");

      toast({ title: t.successTitle, description: t.successMessage });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error sending to Power Automate:", error);
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
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates}`;
    window.open(mapsUrl, "_blank");
  };

  const handleAddToCalendar = () => {
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Uniters Event
DESCRIPTION:Vodojemy Žlutý Kopec
DTSTART:20260122T180000
DTEND:20260122T220000
LOCATION:Vodojemy Žlutý Kopec, Brno
END:VEVENT
END:VCALENDAR
    `;
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uniters-event.ics";
    a.click();
    setCalendarAdded(true);
  };

  if (isSubmitted) {
    return (
      <section className="py-12 sm:py-16 bg-gradient-to-br from-background via-background-light to-background-light">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl animate-scale-in">
            <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-accent mx-auto mb-4 sm:mb-6" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">{t.successTitle}</h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">{t.successMessage}</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button size="lg" onClick={handleNavigationClick} className="bg-primary text-white hover:bg-primary/90">
                <Navigation className="w-5 h-5 mr-2" /> {t.openNavigation}
              </Button>
              {!calendarAdded && (
                <Button size="lg" onClick={handleAddToCalendar} className="bg-primary text-white hover:bg-primary/90">
                  {t.addToCalendar}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-10 bg-gradient-to-br from-background via-background-light to-background-light relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 px-4">{t.title}</h2>
            <p className="text-lg sm:text-xl text-white/80 px-4">{t.subtitle}</p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
                {/* --- Form fields: Name, Email, Phone, Company, PlusOne, GuestName, GDPR, Photo/Video --- */}
                
                {/* Name */}
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.name} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t.namePlaceholder} className="bg-white text-foreground h-11 sm:h-12 text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Email */}
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.email} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder={t.emailPlaceholder} className="bg-white text-foreground h-11 sm:h-12 text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Phone */}
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.phone}</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} placeholder={t.phonePlaceholder} className="bg-white text-foreground h-11 sm:h-12 text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Company */}
                <FormField control={form.control} name="company" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.company} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t.companyPlaceholder} className="bg-white text-foreground h-11 sm:h-12 text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* PlusOne */}
                <FormField control={form.control} name="plusOne" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border p-4 bg-white">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          setShowPlusOneDetails(!!checked);
                          if (!checked) form.setValue("guestName", "");
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-base text-black font-medium cursor-pointer">{t.plusOne}</FormLabel>
                    </div>
                  </FormItem>
                )} />

                {showPlusOneDetails && (
                  <FormField control={form.control} name="guestName" render={({ field }) => (
                    <FormItem className="animate-fade-in">
                      <FormLabel className="text-black sm:text-lg font-semibold">{t.guestName} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder={t.guestNamePlaceholder} {...field} className="bg-white text-foreground h-11 sm:h-12 text-sm sm:text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {/* GDPR Consent */}
                <FormField control={form.control} name="gdprConsent" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-muted-foreground ml-2 cursor-pointer">
                      <span className="text-red-500">*</span>
                      {language === "cs" ? <> Souhlasím se zpracováním osobních údajů dle <span className="underline text-primary cursor-pointer" onClick={() => setIsTermsOpen(true)}>zásad ochrany osobních údajů</span> pro účely registrace.</> : <> I agree to the processing of my personal data according to the <span className="underline text-primary cursor-pointer" onClick={() => setIsTermsOpen(true)}>privacy policy</span> for registration purposes.</>}
                    </FormLabel>
                    <FormMessage />
                    <TermsModal open={isTermsOpen} onClose={() => setIsTermsOpen(false)} language={language} />
                  </FormItem>
                )} />

                {/* Photo/Video Consent */}
                <FormField control={form.control} name="photoVideoConsent" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-muted-foreground ml-2 cursor-pointer">
                      <span className="text-red-500">*</span>
                      {language === "cs" ? t.photoVideoConsent : t.photoVideoConsent}
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Submit */}
                <Button type="submit" size="lg" className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-primary text-white hover:bg-primary/90">
                  {t.submit}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationForm;
