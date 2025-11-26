import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Supabase konfigurace (zde je kód beze změny)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase URL nebo ANON KEY nejsou nastaveny v .env souboru");
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface ParticipantLoginProps {
  language?: "cs" | "en";
}

// -------------------------------------------------------------------
// HELPER FUNKCE: Generování konzistentního chat_id
// -------------------------------------------------------------------

/**
 * Generuje unikátní, seřazené ID konverzace ze dvou uživatelských ID.
 * To zajišťuje, že chat A s B má stejné ID jako chat B s A.
 * @param {string} id1 - ID prvního uživatele (aktuální uživatel)
 * @param {string} id2 - ID druhého uživatele (cílový uživatel)
 * @returns {string} Unikátní chat_id
 */
const getChatId = (id1: string, id2: string): string => {
    // Seřadíme ID, abychom zajistili konzistentnost bez ohledu na pořadí
    const sortedIds = [id1, id2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
};


export default function ParticipantLogin({ language = "cs" }: ParticipantLoginProps) {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

    // NOVÉ CHAT STAVY:
    const [targetProfile, setTargetProfile] = useState<any | null>(null); // Uživatel, se kterým chatujeme
    const [messages, setMessages] = useState<any[]>([]); // Zprávy v aktuálním chatu
    const [messageInput, setMessageInput] = useState(""); // Vstupní pole pro zprávu
    const [chatLoading, setChatLoading] = useState(false);

  // Stávající useEffect pro sledování přihlášení (Beze změny)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  // Odeslat magic link (Beze změny)
  async function sendMagicLink() { /* ... */ }

  // Načtení seznamu účastníků (Beze změny)
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

    // -------------------------------------------------------------------
    // NOVÉ CHAT FUNKCE
    // -------------------------------------------------------------------
    
    /** Funkce, která se spustí po kliknutí na "Chat" u jména účastníka */
    const startChat = (target: any) => {
        // Zde se provede přepnutí do chatovacího okna.
        setTargetProfile(target);
        setMessages([]); // Vyčistíme staré zprávy
    };

    /** Načte historii zpráv pro aktuální konverzaci a nastaví Realtime odběr */
    useEffect(() => {
        if (!targetProfile || !session?.user) return;

        const currentUserId = session.user.id;
        const chatId = getChatId(currentUserId, targetProfile.id);
        
        setChatLoading(true);

        // 1. Načtení historie
        async function loadMessages() {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("chat_id", chatId) // Filtrujeme podle unikátního ID konverzace
                .order("created_at", { ascending: true });

            if (!error) setMessages(data || []);
            setChatLoading(false);
        }

        loadMessages();
        
        // 2. Real-time odběr (Supabase Realtime)
        const channel = supabase.channel(`chat_${chatId}`);
        
        const subscription = channel
            .on(
                'postgres_changes',
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}` // Sledujeme jen tuto konverzaci
                },
                (payload) => {
                    // Po obdržení nové zprávy ji přidáme do stavu
                    setMessages(prev => [...prev, payload.new]);
                }
            )
            .subscribe();

        // Čisticí funkce: Zrušíme odběr, když opustíme chat
        return () => {
            supabase.removeChannel(subscription);
        };
    }, [targetProfile, session]); // Znovu spustit při změně cíle nebo session

    /** Odeslání nové zprávy */
    async function handleSendMessage() {
        if (!messageInput.trim() || !targetProfile || !session?.user) return;

        const currentUserId = session.user.id;
        const chatId = getChatId(currentUserId, targetProfile.id);

        setMessageInput(""); // Okamžité vyčištění vstupu

        const { error } = await supabase
            .from("messages")
            .insert([
                {
                    chat_id: chatId,
                    sender_id: currentUserId,
                    content: messageInput.trim(),
                },
            ]);

        if (error) console.error("Chyba při odesílání zprávy:", error.message);
    }
    
    // -------------------------------------------------------------------
    // RENDER: Rozdělení pohledu
    // -------------------------------------------------------------------

    // Zobrazení chatu (přednostní)
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

                        {/* Zobrazení zpráv */}
                        <div className="h-96 overflow-y-auto mb-4 p-2 space-y-3 bg-gray-50 rounded-lg">
                            {chatLoading ? (
                                <p className="text-center text-muted-foreground">{language === "cs" ? "Načítám chat..." : "Loading chat..."}</p>
                            ) : (
                                messages.map((msg, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`p-3 max-w-xs rounded-xl ${msg.sender_id === currentUserId ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-tl-none'}`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <span className="text-xs opacity-75 block text-right mt-1">
                                                {new Date(msg.created_at).toLocaleTimeString(language)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Vstup pro zprávu */}
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder={language === "cs" ? "Napište zprávu..." : "Write a message..."}
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
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

    // Původní render (Login nebo Seznam účastníků)
  return (
    <section id="participants" className="py-12 bg-background-light">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* LOGIN CARD (Beze změny) */}
        {!session && (
          <Card className="p-6 bg-white shadow-lg border border-border rounded-2xl mb-10">
            {/* ... kód pro přihlášení ... */}
          </Card>
        )}

        {/* PARTICIPANT LIST (Upravený pro startChat) */}
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
                  // Změna zde: Přidání tlačítka a logika, aby nechatoval sám se sebou
                  <li key={p.id} className="py-3 px-1 flex justify-between items-center">
                    <span className="font-medium">{p.name}</span>
                    {p.id !== session.user.id ? (
                      <Button onClick={() => startChat(p)} size="sm">
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