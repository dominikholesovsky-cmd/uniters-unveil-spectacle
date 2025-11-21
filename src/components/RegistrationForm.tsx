// Updated RegistrationForm component without capacity check and with optional checkbox for guided tour at 18:30

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
import { CheckCircle2, Navigation, Calendar } from "lucide-react";

const POWER_AUTOMATE_SUBMIT_URL =
  "https://default54b8b3209661409e9b3e7fc3e0adae.a5.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/7e4728fa129c4a869c877437c791fcea/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Ae_Ysv7Bovz-dFpy-KNXpk5dRI8nM_HBi6WYL46drPA";

interface RegistrationFormProps {
  language: "cs" | "en";
}

const RegistrationForm = ({ language }: RegistrationFormProps) => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      guidedTour: "Mám zájem o komentovanou prohlídku v 18:30",
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
      guidedTour: "I am interested in a guided tour at 6:30 PM",
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
    localStorage.setItem("gdprConsent", "accepted");

    try {
      const response = await fetch(POWER_AUTOMATE_SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, timestamp: new Date().toISOString() }),
      });

      if (!response.ok) throw new Error("Failed to send data");

      toast({ title: t.successTitle, description: t.successMessage });
      setIsSubmitted(true);
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

  if (isSubmitted) {
    return <div>Registrace potvrzena</div>;
  }

  return (
    <section>
      <div className="container mx-auto px-4 max-w-2xl">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.name}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t.namePlaceholder} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.email}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder={t.emailPlaceholder} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.phone}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t.phonePlaceholder} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.company}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t.companyPlaceholder} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guidedTour"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>{t.guidedTour}</FormLabel>
                </FormItem>
              )}
            />


                {/* GDPR Consent */}
                <FormField control={form.control} name="gdprConsent" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-muted-foreground ml-2 cursor-pointer">
                      <span className="text-red-500">*</span>
                      {language === "cs" ? <> {t.gdprConsent} </> : <> {t.gdprConsent} </>}
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Photo/Video Consent */}
                <FormField control={form.control} name="photoVideoConsent" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-muted-foreground ml-2 cursor-pointer">
                      <span className="text-red-500">*</span> {t.photoVideoConsent}
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
    </section>
  );
};

export default RegistrationForm;
