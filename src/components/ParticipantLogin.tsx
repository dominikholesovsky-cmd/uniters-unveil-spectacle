import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
// Předpokládané UI komponenty (používají Tailwind CSS)
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

export default function ParticipantLogin({ language = "cs" }: ParticipantLoginProps) {
    const [email, setEmail] = useState("");
    const [session, setSession] = useState<any>(null);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [targetProfile, setTargetProfile] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    
    // Pro scroll na konec chatu
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // Ref pro odesílací formulář (pro řešení mobilního skákání)
    const chatContainerRef = useRef<HTMLDivElement>(null); 

    // ✅ Značení zpráv jako přečtené
    const markMessagesAsRead = async (senderId: string) => {
        if (!session?.user?.id) return;
        
        const { error } = await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("sender_id", senderId)
            .eq("recipient_id", session.user.id)
            .eq("is_read", false);

        if (error) console.error("Chyba při označování zpráv jako přečtené:", error.message);
        
        loadProfiles();
    }

    // ✅ REVIDOVANÁ FUNKCE loadProfiles
    const loadProfiles = async () => {
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

        // 1. Získání NEPŘEČTENÝCH ZPRÁV
        const { data: unreadData, error: unreadError } = await supabase
            .from("messages")
            .select("sender_id")
            .eq("recipient_id", currentUserId)
            .eq("is_read", false);

        if (unreadError) {
            console.error("CHYBA Supabase při načítání nepřečtených zpráv:", unreadError.message);
        }

        // 2. Mapování počtu notifikací ručním sčítáním
        const unreadMap = (unreadData || []).reduce((acc: Record<string, number>, msg: { sender_id: string }) => {
            acc[msg.sender_id] = (acc[msg.sender_id] || 0) + 1;
            return acc;
        }, {});
        
        const profilesWithUnread = (profilesData || []).map(p => ({
            ...p,
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

            // Sekundární řazení podle jména
            if (companyCompare !== 0) {
                return companyCompare;
            }
            return aName.toLowerCase().localeCompare(bName.toLowerCase());
        });
        
        setProfiles(sorted);
    };


    // ✅ REVIDOVANÁ FUNKCE linkProfileToAuth
    async function linkProfileToAuth(user: any) {
        if (!user.email) return;

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
                    return;
                }
            }
        } else {
            console.warn(`Uživatel ${user.email} nebyl nalezen v seznamu profiles. Vytvářím nový profil.`);

            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    name: user.email.split('@')[0],
                    company: language === "cs" ? 'Nový Uživatel' : 'New User'
                });

            if (insertError) {
                console.error('CHYBA PŘI VKLÁDÁNÍ NOVÉHO PROFILU:', insertError.message);
            }
        }
        
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
                { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${session.user.id}` },
                (_payload) => loadProfiles()
            )
            .subscribe();

        return () => supabase.removeChannel(subscription);
    }, [session?.user?.id]);
    
    // ✅ ÚPRAVA: Scroll na konec chatu. Mělo by zabránit skákání.
    const scrollToBottom = () => {
        // Používáme scrollIntoView na referenční div v chatovacím okně
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        
        // Zkusíme posunout okno, aby chatovací formulář nebyl pod klávesnicí (pro mobil)
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    };

    useEffect(() => {
        // Voláme pouze při načtení/přijetí zprávy, NE při psaní
        scrollToBottom();
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
            setTargetProfile(null);
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
            scrollToBottom(); // Volat scroll po načtení
        };

        loadMessages();

        const channel = supabase.channel(`chat_${chatId}`);
        const subscription = channel
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
                // ✅ DŮLEŽITÉ: Při realtime aktualizaci POUZE přidáme novou zprávu,
                // scrollToBottom se automaticky spustí díky useEffect([messages])
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
        setMessageInput(""); // Vynulování inputu

        // Optimistická aktualizace (neprovedena, ale dobrý zvyk: 
        // setMessages(prev => [...prev, { content, sender_id: currentUserId, created_at: new Date().toISOString() }]);)

        const { error } = await supabase.from("messages").insert([{
            chat_id: chatId,
            sender_id: currentUserId,
            recipient_id: targetProfile.id,
            content,
            is_read: false,
        }]);
        if (error) console.error("Chyba při odesílání zprávy:", error.message);
        
        // Poznámka: Nová zpráva se do pole `messages` přidá přes Realtime listener (viz výše),
        // čímž se spustí `useEffect([messages])` a scroll.
    };

    // --- RENDER CHAT ---
    if (session && targetProfile) {
        const currentUserId = session.user.id;
        return (
            <section className="py-12 bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 max-w-3xl">
                    <Card className="p-6 bg-white shadow-xl border border-gray-200 rounded-2xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h2 className="text-xl font-bold">
                                {language === "cs" ? "Chat s:" : "Chat with:"} <span className="text-blue-600">{targetProfile.name}</span>
                            </h2>
                            <Button className="bg-green-500 text-white hover:bg-green-600 transition-colors" onClick={() => setTargetProfile(null)}>
                                {language === "cs" ? "Zpět na seznam" : "Back to list"}
                            </Button>
                        </div>

                        {/* Chatovací okno */}
                        <div className="h-96 overflow-y-auto mb-4 p-4 space-y-4 bg-gray-100 rounded-lg border border-gray-300">
                            {chatLoading
                                ? <p className="text-center text-gray-500">{language === "cs" ? "Načítám chat..." : "Loading chat..."}</p>
                                : messages.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}>
                                        <div className={`p-3 max-w-xs rounded-xl shadow-md ${msg.sender_id === currentUserId 
                                            ? "bg-blue-600 text-white rounded-br-none" 
                                            : "bg-white text-gray-800 rounded-tl-none border border-gray-200"}`}>
                                            <p className="text-sm break-words">{msg.content}</p>
                                            <span className={`text-xs block text-right mt-1 ${msg.sender_id === currentUserId ? "text-blue-200" : "text-gray-500"}`}>
                                                {new Date(msg.created_at).toLocaleTimeString(language)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            }
                            {/* Referenční bod pro scroll - je stále na dně chatovacího okna */}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        {/* ✅ PŘIDÁN REF PRO SCROLL FORMULÁŘE */}
                        <div ref={chatContainerRef} className="flex gap-2">
                            <Input
                                className="bg-white border border-gray-300 focus:border-blue-500 transition-colors flex-grow"
                                type="text"
                                placeholder={language === "cs" ? "Napište zprávu..." : "Write a message..."}
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            />
                            <Button 
                                className="bg-blue-600 text-white hover:bg-blue-700 font-semibold" 
                                onClick={handleSendMessage} 
                                disabled={!messageInput.trim() || chatLoading}
                            >
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
        // Kontrolujeme, jestli nejde o null nebo undefined před voláním toLowerCase()
        const query = searchQuery.toLowerCase();
        const nameMatch = p.name ? p.name.toLowerCase().includes(query) : false;
        const companyMatch = p.company ? p.company.toLowerCase().includes(query) : false;
        return nameMatch || companyMatch;
    });
    
    return (
        <section className="py-12 bg-gradient-to-t from-background via-background-light to-background-light min-h-screen flex items-center">
            <div className="container mx-auto px-4 max-w-3xl">
                
                {/* Přihlašovací formulář */}
                {!session && (
                    <Card className="p-6 bg-white shadow-xl border border-gray-200 rounded-2xl max-w-md mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                            {language === "cs" ? "Přihlášení do chatu" : "Participant Login"}
                        </h2>
                        <p className="text-gray-500 text-center mb-6">
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
                                className="bg-white border border-gray-300 text-black focus:border-blue-500 transition-colors"
                            />
                            <Button
                                onClick={sendMagicLink}
                                disabled={loading || !email}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl h-12 w-full transition-colors"
                            >
                                {loading
                                    ? language === "cs" ? "Odesílám..." : "Sending..."
                                    : language === "cs" ? "Odeslat přihlašovací odkaz" : "Send login link"}
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Seznam účastníků - ZDE JE KOTVA PRO AUTOMATICKÝ SCROLL */}
                {session && (
                    <Card id="login-section" className="p-6 bg-white shadow-xl border border-gray-200 rounded-2xl animate-fade-in">
                        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                            {language === "cs" ? "Seznam účastníků" : "Participant List"}
                        </h2>
                        
                        {/* ✅ NOVÉ ROZLOŽENÍ PRO VYHLEDÁVÁNÍ A ODHLÁŠENÍ */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <Input
                                type="text"
                                placeholder={language === "cs" ? "Hledat podle jména nebo společnosti..." : "Search by name or company..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-gray-100 border border-gray-300 text-black flex-grow focus:border-blue-500 transition-colors"
                            />

                            <Button 
                                onClick={handleLogout} 
                                disabled={loading} 
                                className="md:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold flex-shrink-0 transition-colors"
                            >
                                {loading ? "Odhlašuji..." : language === "cs" ? "Odhlásit se" : "Log out"}
                            </Button>
                        </div>
                        
                        {profiles.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">
                                {language === "cs" ? "Načítám seznam..." : "Loading list..."}
                            </p>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {filteredProfiles.map((p) => {
                                    const isCurrentUser = p.email && session.user.email && p.email.toLowerCase() === session.user.email.toLowerCase();
                                    return (
                                        <li key={p.id} className="py-3 px-1 flex justify-between items-center hover:bg-gray-50 transition-colors rounded-md">
                                            <div>
                                                <span className="font-medium text-gray-800">{p.name}</span>
                                                {p.company && (
                                                    <span className="text-sm text-gray-500 ml-2">
                                                        ({p.company})
                                                    </span>
                                                )}
                                            </div>
                                            {isCurrentUser ? (
                                                <span className="text-gray-500 text-sm font-semibold">
                                                    ({language === "cs" ? "Já" : "Me"})
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {/* ✅ RENDER NOTIFIKACE */}
                                                    {p.unreadCount > 0 && (
                                                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-600 text-white text-xs font-bold shadow-md animate-pulse">
                                                            {p.unreadCount}
                                                        </span>
                                                    )}

                                                    <Button
                                                        className="bg-green-600 text-white hover:bg-green-700 transition-colors"
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