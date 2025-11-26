import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Supabase konfigurace
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const REDIRECT_URL = import.meta.env.VITE_SUPABASE_REDIRECT_URL;

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

  // Propojení profilu s Auth ID
  async function linkProfileToAuth(user: any) {
    if (!user.email) return;

    const { data: profilesData, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', user.email);

    if (selectError) {
      console.error("Chyba při hledání profilu (SELECT):", selectError.message);
      return;
    }

    const profileData = profilesData?.[0];

    if (profileData && profileData.id !== user.id) {
      console.log(`Propojení profilu: Aktualizuji ID pro ${user.email}`);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ id: user.id })
        .eq('email', user.email);

      if (updateError) {
        console.error('Chyba při propojování profilu (UPDATE):', updateError.message);
      } else {
        loadProfiles();
      }
    } else if (!profileData) {
      console.error('CHYBA PROPOJENÍ: Profil s tímto e-mailem neexistuje.');
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) linkProfileToAuth(session.user);
    });
  }, []);

  const sendMagicLink = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: REDIRECT_URL },
    });
    setLoading(false);

    if (error) {
      console.error(error);
      alert(language === "cs" ? "Nepodařilo se odeslat e-mail." : "Failed to send email.");
    } else {
      alert(language === "cs"
        ? "Odkaz pro přihlášení byl odeslán na váš e-mail."
        : "Login link has been sent to your email."
      );
    }
  };

  const loadProfiles = async () => {
    const { data, error } = await supabase.from("profiles").select("*");
    if (!error) {
      const sorted = (data || []).sort((a, b) => {
        if (a.company && b.company) {
          if (a.company.toLowerCase() === b.company.toLowerCase()) {
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
          }
          return a.company.toLowerCase().localeCompare(b.company.toLowerCase());
        }
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
      setProfiles(sorted);
    }
  };

  useEffect(() => { if (session) loadProfiles(); }, [session]);

  const startChat = (target: any) => {
    setTargetProfile(target);
    setMessages([]);
  };

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

    const { error } = await supabase.from("messages").insert([{
      chat_id: chatId,
      sender_id: currentUserId,
      recipient_id: targetProfile.id,
      content
    }]);

    if (error) console.error("Chyba při odesílání zprávy:", error.message);
  };

  // --- RENDER CHAT ---
  if (session && targetProfile) {
    const currentUserId = session.user.id;
    return (
      <section className="py-12 bg-background-light">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="p-6 bg-white shadow-lg border border-border rounded-2xl">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold">
                {language === "cs" ? "Chat s:" : "Chat with:"} {targetProfile.name}
              </h2>
              <Button className="bg-white text-black border border-gray-300 hover:bg-gray-100 transition-colors" onClick={() => setTargetProfile(null)}>
                {language === "cs" ? "Zpět na seznam" : "Back to list"}
              </Button>
            </div>

            <div className="h-96 overflow-y-auto mb-4 p-2 space-y-3 bg-gray-50 rounded-lg">
              {chatLoading
                ? <p className="text-center text-muted-foreground">{language === "cs" ? "Načítám chat..." : "Loading chat..."}</p>
                : messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}>
                      <div className={`p-3 max-w-xs rounded-xl ${msg.sender_id === currentUserId ? "bg-primary text-primary-foreground rounded-br-none" : "bg-secondary text-secondary-foreground rounded-tl-none"}`}>
                        <p className="text-sm">{msg.content}</p>
                        <span className="text-xs opacity-75 block text-right mt-1">
                          {new Date(msg.created_at).toLocaleTimeString(language)}
                        </span>
                      </div>
                    </div>
                  ))
              }
            </div>

            <div className="flex gap-2">
              <Input
                className="bg-white"
                type="text"
                placeholder={language === "cs" ? "Napište zprávu..." : "Write a message..."}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button className="bg-white text-black border border-gray-300 hover:bg-gray-100 transition-colors" onClick={handleSendMessage} disabled={!messageInput.trim()}>
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
    <section className="py-12 sm:py-16 bg-gradient-to-tr from-blue-500 via-teal-400 to-teal-200 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        {!session && (
          <Card className="max-w-md mx-auto bg-white rounded-2xl p-10 shadow-xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {language === "cs" ? "Přihlášení do chatovací místnmosti" : "Participant Login"}
            </h2>
            <p className="text-gray-700 mb-6">
              {language === "cs"
                ? "Zadejte svůj e-mail a my vám pošleme magický odkaz."
                : "Enter your email and we'll send you a magic login link."}
            </p>
            <div className="flex flex-col gap-4">
              <Input
                type="email"
                placeholder="email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-100 border-2 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-black"
              />
              <Button
                onClick={sendMagicLink}
                disabled={loading || !email}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl h-14 w-full transition-all shadow-lg"
              >
                {loading
                  ? language === "cs" ? "Odesílám..." : "Sending..."
                  : language === "cs" ? "Odeslat přihlašovací odkaz" : "Send login link"}
              </Button>
            </div>
            <p className="text-sm text-gray-200 mt-4">
              {language === "cs" ? "Zkontrolujte svůj e-mail pro vstup na večerní akci." : "Check your email to enter the evening event."}
            </p>
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
                    <div>
                      <span className="font-medium">{p.name}</span>
                      {p.company && <span className="text-sm text-muted-foreground ml-2">({p.company})</span>}
                    </div>
                    {p.id !== session.user.id ? (
                      <Button className="bg-white text-black border border-gray-300 hover:bg-gray-100 transition-colors" onClick={() => startChat(p)} size="sm">
                        {language === "cs" ? "Chat" : "Chat"}
                      </Button>
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
