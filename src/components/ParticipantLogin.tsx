import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Supabase konfigurace (předpokládáme, že proměnné jsou v .env)
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

// Jednotný styl tlačítek
const buttonClass = "bg-white text-black border border-gray-300 hover:bg-gray-100 transition-colors";

export default function ParticipantLogin({ language = "cs" }: ParticipantLoginProps) {
    const [email, setEmail] = useState("");
    const [session, setSession] = useState<any>(null);
    // Typ profileru rozšířen o unreadCount pro notifikace
    const [profiles, setProfiles] = useState<any[]>([]); 
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); 

    const [targetProfile, setTargetProfile] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    
    // Pro scroll na konec chatu
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ✅ Značení zpráv jako přečtené
    const markMessagesAsRead = async (senderId: string) => {
        if (!session?.user?.id) return;
        
        // Nastavíme is_read na TRUE u zpráv, kde jsem příjemce a zpráva není přečtená
        const { error } = await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("sender_id", senderId)      
            .eq("recipient_id", session.user.id) 
            .eq("is_read", false);         

        if (error) console.error("Chyba při označování zpráv jako přečtené:", error.message);
        
        // Reloadneme seznam profilů, aby se notifikace vynulovala v UI
        loadProfiles();
    }

    // ✅ REVIDOVANÁ FUNKCE loadProfiles
    const loadProfiles = async () => {
        // Načtení všech profilů
        const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("*");
        
        if (profilesError) {
            console.error("Chyba při načítání profilů:", profilesError.message);
            setProfiles([]);
            return;
        }

        const currentUserId = session?.user?.id;
        if (!currentUserId) {
            setProfiles(profilesData || []);
            return;
        }

        // 1. Získání NEPŘEČTENÝCH ZPRÁV (BEZPEČNÝ DOTAZ)
        const { data: unreadData, error: unreadError } = await supabase
            .from("messages")
            // Vrací jen sloupce sender_id pro ruční sčítání
            .select("sender_id") 
            .eq("recipient_id", currentUserId) // Jsem příjemce
            .eq("is_read", false);           // A zpráva je nepřečtená

        if (unreadError) {
            console.error("CHYBA Supabase při načítání nepřečtených zpráv:", unreadError.message);
            // Necháme unreadData být null/prázdné, abychom mohli pokračovat
        }

        // 2. Mapování počtu notifikací ručním sčítáním v JavaScriptu
        // Vytvoří mapu: { 'sender_id_1': 3, 'sender_id_2': 1, ... }
        const unreadMap = (unreadData || []).reduce((acc: Record<string, number>, msg: { sender_id: string }) => {
            // Sčítání v JS: Pokud odesílatel již existuje, přičteme 1, jinak začneme na 1.
            acc[msg.sender_id] = (acc[msg.sender_id] || 0) + 1; 
            return acc;
        }, {});
        
        // Zkontrolujte mapu v konzoli
        console.log('Vytvořená unread mapa:', unreadMap); 

        // 3. Přiřazení počtu k profilům a seřazení
        const profilesWithUnread = (profilesData || []).map(p => ({
            ...p,
            // DŮLEŽITÉ: Přiřazení vlastnosti unreadCount. Použijeme 0, pokud neexistuje.
            // Zde p.id MUSÍ odpovídat sender_id v messages (tj. Auth ID)
            unreadCount: unreadMap[p.id] || 0, 
        }));

        // ZJEDNODUŠENÁ LOGIKA ŘAZENÍ (Firma > Jméno)
        const sorted = profilesWithUnread.sort((a, b) => {
            const aCompany = a.company || "";
            const bCompany = b.company || "";
            const aName = a.name || "";
            const bName = b.name || "";

            // Primární řazení podle společnosti
            const companyCompare = aCompany.toLowerCase().localeCompare(bCompany.toLowerCase());

            // Pokud se společnosti shodují (výsledek je 0), řadíme podle jména
            if (companyCompare !== 0) {
                return companyCompare;
            }

            // Sekundární řazení podle jména (pokud se společnosti shodují nebo jsou prázdné)
            return aName.toLowerCase().localeCompare(bName.toLowerCase());
        });
        
        setProfiles(sorted);
    };


    // ✅ REVIDOVANÁ FUNKCE linkProfileToAuth
    async function linkProfileToAuth(user: any) {
        if (!user.email) return;

        // 1. Hledání profilu podle e-mailu
        const { data: profilesData, error: selectError } = await supabase
          .from('profiles')
          .select('id, name') 
          .eq('email', user.email);

        if (selectError) {
            console.error("Chyba při hledání profilu (SELECT):", selectError.message);
            return;
        }

        const profileData = profilesData?.[0];

        if (profileData) {
            // --- PROFIL NALEZEN (stávající uživatel) ---
            // Musíme zajistit, že ID profilu se shoduje s Auth ID
            if (!profileData.id || profileData.id !== user.id) {
                console.log(`%cPropojení profilu: Aktualizuji ID pro ${user.email} na ${user.id}`, 'color: orange; font-weight: bold;');
                                
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ id: user.id })
                    .eq('email', user.email);

                if (updateError) {
                    console.error('CHYBA PŘI AKTUALIZACI ID:', updateError.message);
                } else {
                    // 🎉 ÚSPĚŠNÁ OPRAVA ID: IHNED ZNOVU NAČTEME PROFILY
                    loadProfiles(); 
                    return; // Vracíme se, abychom zabránili volání loadProfiles na konci
                }
            }
        } else {
            // --- PROFIL NENALEZEN (NOVÝ UŽIVATEL) ---
            console.warn(`Uživatel ${user.email} nebyl nalezen v seznamu profiles. Vytvářím nový profil.`);

            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id, // Důležité: Nastavení Auth ID
                    email: user.email,
                    name: user.email.split('@')[0], // Dočasné jméno
                    company: language === "cs" ? 'Nový Uživatel' : 'New User'
                });

            if (insertError) {
                console.error('CHYBA PŘI VKLÁDÁNÍ NOVÉHO PROFILU:', insertError.message);
            }
        }
        
        // Načte profily v případě, že se profil vložil nebo existovalo shodné ID
        loadProfiles();
    }

    // Hlavní useEffect pro sledování Auth a načtení profilů
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            const session = data.session;
            setSession(session);
            if (session?.user) {
                linkProfileToAuth(session.user);
            } else {
                setProfiles([]);
            }
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) linkProfileToAuth(session.user);
        });
        
        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    // ✅ Realtime listener pro notifikace
    useEffect(() => {
        if (!session?.user?.id) return;

        const channel = supabase.channel(`notifications_${session.user.id}`);
        const subscription = channel
            .on(
                "postgres_changes",
                // Posloucháme INSERT do messages, kde jsem příjemce
                { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${session.user.id}` }, 
                // Při každé nové zprávě reloadneme profily pro aktualizaci počtu
                (_payload) => loadProfiles() 
            )
            .subscribe();

        return () => supabase.removeChannel(subscription);
    }, [session?.user?.id]); // Závisí na ID uživatele
    
    // Scroll na konec chatu, když se načtou nové zprávy
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    // Odhlašování
    const handleLogout = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        setLoading(false);
        if (error) console.error('Chyba při odhlašování:', error.message);
        else {
            setSession(null);
            setProfiles([]);
            setSearchQuery('');
            setTargetProfile(null); // Zavřít chat po odhlášení
        }
    };

    // Odeslání magic link (ZŮSTÁVÁ STEJNÉ)
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

    const startChat = (target: any) => {
        setTargetProfile(target);
        setMessages([]);
        // ✅ DŮLEŽITÉ: Okamžitě označit zprávy jako přečtené
        markMessagesAsRead(target.id); 
    };

    // Načtení historie zpráv + realtime (ZŮSTÁVÁ STEJNÉ)
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
            content,
            is_read: false, // Vždy začínáme jako nepřečtené
        }]);
        if (error) console.error("Chyba při odesílání zprávy:", error.message);
    };

    // --- RENDER CHAT ---
    if (session && targetProfile) {
        // ... Render chat je stejný ...
        const currentUserId = session.user.id;
        return (
            <section className="py-12 bg-gradient-to-t from-background via-background-light to-background-light min-h-screen">
                <div className="container mx-auto px-4 max-w-3xl">
                    <Card className="p-6 bg-white shadow-lg border border-border rounded-2xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h2 className="text-xl font-bold">
                                {language === "cs" ? "Chat s:" : "Chat with:"} {targetProfile.name}
                            </h2>
                            <Button className={buttonClass} onClick={() => setTargetProfile(null)}>
                                {language === "cs" ? "Zpět na seznam" : "Back to list"}
                            </Button>
                        </div>

                        {/* Chatovací okno */}
                        <div className="h-96 overflow-y-auto mb-4 p-2 space-y-3 bg-gray-50 rounded-lg">
                            {chatLoading
                                ? <p className="text-center text-muted-foreground">{language === "cs" ? "Načítám chat..." : "Loading chat..."}</p>
                                : messages.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}>
                                        <div className={`p-3 max-w-xs rounded-xl ${msg.sender_id === currentUserId ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 text-gray-800 rounded-tl-none"}`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <span className="text-xs opacity-75 block text-right mt-1">
                                                {new Date(msg.created_at).toLocaleTimeString(language)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            }
                            {/* Referenční bod pro scroll */}
                            <div ref={messagesEndRef} />
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
                            <Button className={buttonClass} onClick={handleSendMessage} disabled={!messageInput.trim()}>
                                {language === "cs" ? "Odeslat" : "Send"}
                            </Button>
                        </div>
                    </Card>
                </div>
            </section>
        );
    }

    // --- RENDER LOGIN / SEZNAM ÚČASTNÍKŮ ---
    
    const filteredProfiles = profiles.filter(p => {
        const query = searchQuery.toLowerCase();
        const nameMatch = p.name ? p.name.toLowerCase().includes(query) : false;
        const companyMatch = p.company ? p.company.toLowerCase().includes(query) : false;
        return nameMatch || companyMatch;
    });
    
    return (
        <section className="py-12 bg-gradient-to-t from-background via-background-light to-background-light min-h-screen flex items-center">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Přihlašovací formulář (ZŮSTÁVÁ STEJNÝ) */}
                {!session && (
                    <Card className="p-6 bg-white shadow-lg border border-border rounded-2xl max-w-md mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-center">{language === "cs" ? "Přihlášení do chatovací místnosti" : "Participant Login"}</h2>
                        <p className="text-muted-foreground text-center mb-6">
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
                                className="bg-white border border-gray-300 text-black"
                            />
                            <Button
                                onClick={sendMagicLink}
                                disabled={loading || !email}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl h-14 w-full"
                            >
                                {loading
                                    ? language === "cs" ? "Odesílám..." : "Sending..."
                                    : language === "cs" ? "Odeslat přihlašovací odkaz" : "Send login link"}
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Seznam účastníků */}
                {session && (
                    <Card className="p-6 bg-white shadow-lg border border-border rounded-2xl animate-fade-in">
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            {language === "cs" ? "Seznam účastníků" : "Participant List"}
                        </h2>

                        {/* Vyhledávací pole (ZŮSTÁVÁ STEJNÉ) */}
                        <Input
                            type="text"
                            placeholder={language === "cs" ? "Hledat podle jména nebo společnosti..." : "Search by name or company..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-100 border border-gray-300 text-black mb-4"
                        />

                        {/* Tlačítko pro odhlášení */}
                        <Button 
                            onClick={handleLogout} 
                            disabled={loading} 
                            className="w-full mb-6 bg-red-500 hover:bg-red-600 text-white font-semibold"
                        >
                            {loading ? "Odhlašuji..." : language === "cs" ? "Odhlásit se" : "Log out"}
                        </Button>
                        
                        {profiles.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                                {language === "cs" ? "Načítám seznam..." : "Loading list..."}
                            </p>
                        ) : (
                            <ul className="divide-y divide-border">
                                {filteredProfiles.map((p) => {
                                    console.log(`Profil ${p.name}: ID profilu ${p.id}, E-mail: ${p.email}`); // KONTROLNÍ LOG
                                    console.log(`Profil ${p.name}: Nepřečtených zpráv ${p.unreadCount}`); // KONTROLNÍ LOG
                                    const isCurrentUser = p.email && session.user.email && p.email.toLowerCase() === session.user.email.toLowerCase();
                                    return (
                                        <li key={p.id} className="py-3 px-1 flex justify-between items-center">
                                            <div>
                                                <span className="font-medium">{p.name}</span>
                                                {p.company && (
                                                    <span className="text-sm text-muted-foreground ml-2">
                                                        ({p.company})
                                                    </span>
                                                )}
                                            </div>
                                            {isCurrentUser ? (
                                                <span className="text-muted-foreground text-sm">
                                                    ({language === "cs" ? "Já" : "Me"})
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-2"> 
                                                    {/* ✅ RENDER NOTIFIKACE */}
                                                    {p.unreadCount > 0 && (
                                                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold mr-1">
                                                            {p.unreadCount}
                                                        </span>
                                                    )}

                                                    <Button
                                                        className={buttonClass}
                                                        onClick={() => startChat(p)}
                                                        size="sm"
                                                    >
                                                        {language === "cs" ? "Chat" : "Chat"}
                                                    </Button>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Card>
                )}
            </div>
        </section>
    );
}