import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Supabase konfigurace
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const REDIRECT_URL = import.meta.env.VITE_SUPABASE_REDIRECT_URL; // <- přesměrování po přihlášení

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL nebo ANON KEY nejsou nastaveny v .env souboru");
}
if (!REDIRECT_URL) {
  throw new Error("VITE_SUPABASE_REDIRECT_URL není nastaven v .env souboru");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface ParticipantLoginProps {
  language?: "cs" | "en";
}

// Funkce pro konzistentní chat_id mezi dvěma uživateli
const getChatId = (id1: string, id2: string): string => {
  const sortedIds = [id1, id2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

export default function ParticipantLogin({ language = "cs" }: ParticipantLoginProps) {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [targetProfile, setTargetProfile] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Sleduj přihlášení
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  // Odeslání magic link
  const sendMagicLink = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: REDIRECT_URL, // <--- přesměrování po přihlášení
      },
    });
    setLoading(false);

    if (error) {
      console.error(error);
      alert(language === "cs" ? "Nepodařilo se odeslat e-mail." : "Failed to send email.");
    } else {
      alert(
        language === "cs"
          ? "Odkaz pro přihlášení byl odeslán na váš e-mail."
          : "Login link has been sent to your email."
      );
    }
  };

  // Načtení seznamu účastníků
  const loadProfiles = async () => {
    const { data, error } = await supabase.from("profiles").select("*").order("name", { ascending: true });
    if (!error) setProfiles(data || []);
  };

  useEffect(() => {
    if (session) loadProfiles();
  }, [session]);

  // Start chat s uživatelem
  const startChat = (target: any) => {
    setTargetProfile(target);
    setMessages([]);
  };

  // Načtení historie zpráv + realtime
  useEffect(() => {
    if (!targetProfile || !session?.user) return;

    const currentUserId = session.user.id;
    const chatId = getChatId(currentUserId, targetProfile.id);
    setChatLoading(true);

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      if (!error) setMessages(data || []);
      setChatLoading(false);
    };

    loadMessages();

    const channel = supabase.channel(`chat_${chatId}`);
    const subscription = channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [targetProfile, session]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !targetProfile || !session?.user) return;

    const currentUserId = session.user.id;
    const chatId = getChatId(currentUserId, targetProfile.id);
    const content = messageInput.trim();
    setMessageInput("");

    const { error } = await supabase.from("messages").insert([{ chat_id: chatId, sender_id: currentUserId, content }]);
    if (error) console.error("Chyba při odesílání zprávy:", error.message);
  };

  // --- RENDER CHATU ---
  if (session && targetProfile) {
    const currentUserId = session.user.id;
    return (
      <section id="chat-window" className="py-12 bg-background-light">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="p-6 bg-white shadow-lg border border-border rounded-2xl">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold">
                {language === "cs" ? "Chat s:" : "Chat with:"} {targetProfile.name}
              </h2>
              <Button variant="outline" onClick={() => setTargetProfile(null)}>
                {language === "cs" ? "Zpět na seznam" : "Back to list"}
              </Button>
            </div>

            <div className="h-96 overflow-y-auto mb-4 p-2 space-y-3 bg-gray-50 rounded-lg">
              {chatLoading ? (
                <p className="text-center text-muted-foreground">{language === "cs" ? "Načítám chat..." : "Loading chat..."}</p>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`p-3 max-w-xs rounded-xl ${
                        msg.sender_id === currentUserId
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-secondary text-secondary-foreground rounded-tl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <span className="text-xs opacity-75 block text-right mt-1">
                        {new Date(msg.created_at).toLocaleTimeString(language)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={language === "cs" ? "Napište zprávu..." : "Write a message..."}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                {language === "cs" ? "Odeslat" : "Send"}
              </Button>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  // --- RENDER LOGIN / SEZNAM ÚČASTNÍKŮ ---
  return (
    <section id="participants" className="py-12 bg-background-light">
      <div className="container mx-auto px-4 max-w-3xl">
        {!session && (
          <Card className="p-6 bg-white shadow-lg border border-border rounded-2xl mb-10">
            <h2 className="text-2xl font-bold mb-4 text-center">{language === "cs" ? "Přihlášení účastníka" : "Participant Login"}</h2>
            <p className="text-muted-foreground text-center mb-6">
              {language === "cs"
                ? "Zadejte svůj e-mail a my vám pošleme magický odkaz."
                : "Enter your email and we'll send you a magic login link."}
            </p>
            <div className="flex flex-col gap-4">
              <Input type="email" placeholder="email@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button onClick={sendMagicLink} disabled={loading || !email}>
                {loading
                  ? language === "cs"
                    ? "Odesílám..."
                    : "Sending..."
                  : language === "cs"
                  ? "Odeslat přihlašovací odkaz"
                  : "Send login link"}
              </Button>
            </div>
          </Card>
        )}

        {session && (
          <Card className="p-6 bg-white shadow-lg border border-border rounded-2xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-center">{language === "cs" ? "Seznam účastníků" : "Participant List"}</h2>
            {profiles.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">{language === "cs" ? "Načítám seznam..." : "Loading list..."}</p>
            ) : (
              <ul className="divide-y divide-border">
                {profiles.map((p) => (
                  <li key={p.id} className="py-3 px-1 flex justify-between items-center">
                    <span className="font-medium">{p.name}</span>
                    {p.id !== session.user.id ? (
                      <Button onClick={() => startChat(p)} size="sm">{language === "cs" ? "Chat" : "Chat"}</Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">({language === "cs" ? "Já" : "Me"})</span>
                    )}
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
