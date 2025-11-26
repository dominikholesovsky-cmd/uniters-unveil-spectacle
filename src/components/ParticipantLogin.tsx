import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Supabase konfigurace pro Vite/CRA
// Ujisti se, že máš v root projektu .env s těmito proměnnými:
// VITE_SUPABASE_URL=https://xxxxxx.supabase.co
// VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL nebo ANON KEY nejsou nastaveny v .env souboru");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface ParticipantLoginProps {
  language?: "cs" | "en";
}

export default function ParticipantLogin({ language = "cs" }: ParticipantLoginProps) {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Sleduj změny přihlášení
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  // Odeslat magic link
  async function sendMagicLink() {
    setLoading(true);
    await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    alert(
      language === "cs"
        ? "Odkaz pro přihlášení byl odeslán na váš e-mail."
        : "Login link has been sent to your email."
    );
  }

  // Načtení seznamu účastníků
  async function loadProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("name", { ascending: true });

    if (!error) setProfiles(data || []);
  }

  useEffect(() => {
    if (session) loadProfiles();
  }, [session]);

  return (
    <section id="participants" className="py-12 bg-background-light">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* LOGIN CARD */}
        {!session && (
          <Card className="p-6 bg-white shadow-lg border border-border rounded-2xl mb-10">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {language === "cs" ? "Přihlášení účastníka" : "Participant Login"}
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              {language === "cs"
                ? "Zadejte svůj e-mail a my vám pošleme magický odkaz."
                : "Enter your email and we'll send you a magic login link."}
            </p>

            <div className="flex flex-col gap-4 bg-white">
              <Input
                type="email"
                placeholder={language === "cs" ? "email@domena.cz" : "email@domain.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button onClick={sendMagicLink} disabled={loading || !email}>
                {loading
                  ? language === "cs" ? "Odesílám..." : "Sending..."
                  : language === "cs" ? "Odeslat přihlašovací odkaz" : "Send login link"}
              </Button>
            </div>
          </Card>
        )}

        {/* PARTICIPANT LIST */}
        {session && (
          <Card className="p-6 bg-white shadow-lg border border-border rounded-2xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {language === "cs" ? "Seznam účastníků" : "Participant List"}
            </h2>

            {profiles.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {language === "cs" ? "Načítám seznam..." : "Loading list..."}
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {profiles.map((p) => (
                  <li key={p.id} className="py-3 px-1 flex justify-between">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground text-sm">{p.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </section>
  );
}