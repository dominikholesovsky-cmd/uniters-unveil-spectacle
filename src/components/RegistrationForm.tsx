// RegistrationForm updated: white fields + gallery-style dark gradient background

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

const RegistrationForm = ({ language }) => {
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
        "Souhlasím s pořizováním fotografií a videí během akce.",
      submit: "Potvrdit registraci",
      successTitle: "Registrace potvrzena!",
      successMessage: "Děkujeme za registraci.",
      company: "Firma",
      companyPlaceholder: "Název firmy",
    },
  };

  const t = content[language];

  const formSchema = z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    phone: z.string().trim().optional(),
    company: z.string().trim().min(1),
    guidedTour: z.boolean().optional(),
    gdprConsent: z.literal(true),
    photoVideoConsent: z.literal(true),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      guidedTour: false,
      gdprConsent: undefined,
      photoVideoConsent: undefined,
    },
  });

  const onSubmit = async (values) => {
    toast({ title: t.successTitle, description: t.successMessage });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section className="py-12 sm:py-16 bg-gradient-to-t from-[#0A0A0A] via-[#111] to-[#222] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center bg-white text-black rounded-2xl p-10 shadow-xl">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">{t.successTitle}</h2>
            <p className="text-lg mb-6">{t.successMessage}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="registration-form"
      className="py-16 bg-gradient-to-t from-[#0A0A0A] via-[#111] to-[#222]"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-10 shadow-2xl">
          <h2 className="text-4xl font-bold text-center mb-4">{t.title}</h2>
          <p className="text-center text-gray-600 mb-8">{t.subtitle}</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* NAME */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.name} <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-white border-gray-300 text-black"
                        placeholder={t.namePlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* EMAIL */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.email} <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        className="bg-white border-gray-300 text-black"
                        placeholder={t.emailPlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PHONE */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.phone}</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        {...field}
                        className="bg-white border-gray-300 text-black"
                        placeholder={t.phonePlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* COMPANY */}
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.company} <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-white border-gray-300 text-black"
                        placeholder={t.companyPlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
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
                    <FormLabel className="text-black">
                      <span className="text-red-500">*</span> {t.gdprConsent}
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PHOTO CONSENT */}
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
                    <FormLabel className="text-black">
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