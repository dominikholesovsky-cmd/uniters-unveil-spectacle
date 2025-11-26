import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
// Předpokládané UI komponenty z Shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react"; // Ikonka pro tlačítko

// --- Supabase konfigurace ---
// PŘEDPOKLAD: Tyto proměnné jsou správně nastaveny ve vašem .env souboru
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

// Pomocná funkce pro generování unikátního chat ID (lexikograficky seřazené)
const getChatId = (id1: string, id2: string): string => {
    const sortedIds = [id1, id2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
};

// --- Komponenta ChatButtonAndModal ---
export default function ChatButtonAndModal({ language = "cs" }: ParticipantLoginProps) {
    // Stavy pro UI a data
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [session, setSession] = useState<any>(null);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [targetProfile, setTargetProfile] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);

    // Ref pro scroll na konec chatu
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);


    // --- Textové překlady ---
    const t = {
        cs: {
            openChat: "Otevřít Chat",
            loginTitle: "Přihlášení do chatu",
            loginNotice: "Zadejte svůj e-mail a my vám pošleme magický odkaz.",
            sendLink: "Odeslat přihlašovací odkaz",
            sending: "Odesílám...",
            emailSent: "Odkaz pro přihlášení byl odeslán na váš e-mail.",
            emailFailed: "Nepodařilo se odeslat e-mail.",
            listTitle: "Seznam účastníků",
            searchPlaceholder: "Hledat podle jména nebo společnosti...",
            logout: "Odhlásit se",
            loggingOut: "Odhlašuji...",
            me: "Já",
            loadingList: "Načítám seznam...",
            chatWith: "Chat s:",
            backToList: "Zpět na seznam",
            loadingChat: "Načítám chat...",
            writeMessage: "Napište zprávu...",
            send: "Odeslat",
        },
        en: {
            openChat: "Open Chat",
            loginTitle: "Participant Login",
            loginNotice: "Enter your email and we'll send you a magic login link.",
            sendLink: "Send login link",
            sending: "Sending...",
            emailSent: "Login link has been sent to your email.",
            emailFailed: "Failed to send email.",
            listTitle: "Participant List",
            searchPlaceholder: "Search by name or company...",
            logout: "Log out",
            loggingOut: "Logging out...",
            me: "Me",
            loadingList: "Loading list...",
            chatWith: "Chat with:",
            backToList: "Back to list",
            loadingChat: "Loading chat...",
            writeMessage: "Write a message...",
            send: "Send",
        },
    }[language] ?? t.cs;

    // --- Funkce pro označení zpráv jako přečtené ---
    const markMessagesAsRead = async (senderId: string) => {
        const currentUserId = session?.user?.id;
        if (!currentUserId) return;
        
        const { error } = await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("sender_id", senderId)
            .eq("recipient_id", currentUserId)
            .eq("is_read", false);

        if (error) console.error("Chyba při označování zpráv jako přečtené:", error.message);
        
        // Znovu načte profily pro aktualizaci notifikací
        loadProfiles(currentUserId);
    }

    // --- Funkce pro načtení profilů a notifikací ---
    const loadProfiles = async (currentUserId: string | null = session?.user?.id) => {
        setLoading(true);
        
        const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("*");
        
        if (profilesError) {
            console.error("Chyba při načítání profilů:", profilesError.message);
            setProfiles([]);
            setTotalUnreadCount(0);
            setLoading(false);
            return;
        }

        if (!currentUserId) {
            setProfiles(profilesData || []);
            setTotalUnreadCount(0);
            setLoading(false);
            return;
        }

        // 1. Získání NEPŘEČTENÝCH ZPRÁV pro aktuálního uživatele
        const { data: unreadData, error: unreadError } = await supabase
            .from("messages")
            .select("sender_id")
            .eq("recipient_id", currentUserId)
            .eq("is_read", false);

        if (unreadError) {
            console.error("CHYBA Supabase při načítání nepřečtených zpráv:", unreadError.message);
        }

        // 2. Mapování počtu notifikací a sčítání celkového počtu
        let newTotalUnreadCount = 0;

        const unreadMap = (unreadData || []).reduce((acc: Record<string, number>, msg: { sender_id: string }) => {
            acc[msg.sender_id] = (acc[msg.sender_id] || 0) + 1;
            newTotalUnreadCount += 1;
            return acc;
        }, {});
        
        setTotalUnreadCount(newTotalUnreadCount);
        
        const profilesWithUnread = (profilesData || []).map(p => ({
            ...p,
            unreadCount: unreadMap[p.id] || 0,
        }));

        // Logika řazení podle společnosti a jména
        const sorted = profilesWithUnread.sort((a, b) => {
            const aCompany = a.company || "";
            const bCompany = b.company || "";
            const aName = a.name || "";
            const bName = b.name || "";

            const companyCompare = aCompany.toLowerCase().localeCompare(bCompany.toLowerCase());

            if (companyCompare !== 0) {
                return companyCompare;
            }
            return aName.toLowerCase().localeCompare(bName.toLowerCase());
        });
        
        setProfiles(sorted);
        setLoading(false); 
    };

    // --- Funkce pro propojení profilu s autentizovaným uživatelem ---
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
            // Profil existuje, zkontroluj/aktualizuj ID
            if (!profileData.id || profileData.id !== user.id) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ id: user.id })
                    .eq('email', user.email);

                if (updateError) {
                    console.error('CHYBA PŘI AKTUALIZACI ID:', updateError.message);
                } else {
                    loadProfiles(user.id);
                    return;
                }
            }
        } else {
            // Profil neexistuje, vytvoř nový
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
        
        loadProfiles(user.id);
    }

    // --- Efekty pro sledování Auth stavu a Realtime notifikace ---
    useEffect(() => {
        // 1. Kontrola při spuštění/refresh stránky (pro Magic Link)
        supabase.auth.getSession().then(({ data }) => {
            const session = data.session;
            setSession(session);
            
            if (session?.user) {
                linkProfileToAuth(session.user);

                // Logika pro automatické otevření Modalu po přihlášení
                // Kontrola, zda se jedná o návrat z Magic Linku (tokeny se přidávají do URL hash)
                const urlHash = window.location.hash;
                if (urlHash.includes('access_token=') && urlHash.includes('refresh_token=')) {
                    // Po úspěšném přihlášení se automaticky otevře modal
                    setIsOpen(true);
                    
                    // 🔥 ÚPRAVA: Vyčištění hash z URL
                    history.replaceState(null, '', window.location.pathname);
                }

            } else {
                setProfiles([]);
                setTotalUnreadCount(0);
                setLoading(false);
            }
        });

        // 2. Naslouchání změnám stavu přihlášení
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            if (session?.user) {
                linkProfileToAuth(session.user);
                
                // 🔥 ÚPRAVA: Odebráno automatické setIsOpen(true) na event === 'SIGNED_IN'.
                // To způsobovalo otevírání modalu při každém obnovení relace.
                // Nyní se spoléháme POUZE na kontrolu URL hashe v bloku getSession.

            } else {
                setProfiles([]);
                setTotalUnreadCount(0);
                setTargetProfile(null);
            }
        });
        
        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    // Realtime listener pro notifikace (příchozí zprávy)
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
    
    // --- Scroll logika pro chat ---
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        if (chatContainerRef.current) {
            // Zajištění scrollu na formulář (užitečné na mobilu)
            chatContainerRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    // --- Obsluha přihlášení/odhlašování ---
    const handleLogout = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        setLoading(false);
        if (error) console.error('Chyba při odhlašování:', error.message);
        else {
            setIsOpen(false); // Zavřít modal po odhlášení
            setSession(null);
            setProfiles([]);
            setSearchQuery('');
            setTargetProfile(null);
            setTotalUnreadCount(0);
        }
    };

    const sendMagicLink = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: REDIRECT_URL },
        });
        setLoading(false);
        if (error) {
            console.error(error);
            alert(t.emailFailed);
        } else {
            alert(t.emailSent);
        }
    };

    // --- Obsluha chatu ---
    const startChat = (target: any) => {
        setTargetProfile(target);
        setMessages([]);
        markMessagesAsRead(target.id); // Označí zprávy jako přečtené při otevření chatu
    };

    // Načtení historie a Realtime pro konkrétní chat
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
            scrollToBottom();
        };

        loadMessages();

        // Realtime listener pro aktuální chat
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
            is_read: false,
        }]);
        if (error) console.error("Chyba při odesílání zprávy:", error.message);
    };

    // Filtrování profilů
    const filteredProfiles = profiles.filter(p => {
        const query = searchQuery.toLowerCase();
        const nameMatch = p.name ? p.name.toLowerCase().includes(query) : false;
        const companyMatch = p.company ? p.company.toLowerCase().includes(query) : false;
        return nameMatch || companyMatch;
    });

    // ----------------------------------------------------------------------------------
    // RENDER - TLAČÍTKO a MODAL
    // ----------------------------------------------------------------------------------

    return (
        <>
            {/* Tlačítko pro otevření chatu - ZCELA BEZ FOCUS OKRAJE */}
            <Button
                onClick={() => setIsOpen(true)}
                // Potlačení focus ring i pro tlačítko na stránce
                className="fixed bottom-6 left-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-105 focus-visible:ring-0 focus-visible:ring-offset-0"
            >
                <MessageSquare className="w-6 h-6 mr-2" />
                {t.openChat}
                {/* ODZNAK s celkovým počtem nepřečtených zpráv */}
                {totalUnreadCount > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-600 text-white text-xs font-bold ring-2 ring-white shadow-lg animate-bounce">
                        {totalUnreadCount}
                    </span>
                )}
            </Button>

            {/* Modal pro celý chatovací systém */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl w-full h-[90vh] p-6 sm:p-8 overflow-y-auto bg-white text-gray-900 flex flex-col">
                    
                    <DialogHeader className="flex-shrink-0 border-b pb-3 mb-4">
                        <DialogTitle className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
                            {session ? t.listTitle : t.loginTitle}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Obsah Modalu - Přihlášení, Seznam nebo Chat */}
                    <div className="flex-grow overflow-y-auto">

                        {/* --- CHAT S KONKRÉTNÍM ÚČASTNÍKEM --- */}
                        {session && targetProfile && (
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                                    <h2 className="text-xl font-bold">
                                        {t.chatWith} <span className="text-blue-600">{targetProfile.name}</span>
                                    </h2>
                                    <Button 
                                        className="bg-green-500 text-white hover:bg-green-600 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
                                        onClick={() => setTargetProfile(null)}
                                    >
                                        {t.backToList}
                                    </Button>
                                </div>

                                {/* Chatovací okno */}
                                <div className="flex-grow overflow-y-auto mb-4 p-4 space-y-4 bg-gray-100 rounded-lg border border-gray-300">
                                    {chatLoading
                                        ? <p className="text-center text-gray-500">{t.loadingChat}</p>
                                        : messages.map((msg, index) => {
                                                const currentUserId = session.user.id;
                                                return (
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
                                                );
                                            })
                                    }
                                    <div ref={messagesEndRef} />
                                </div>
                                
                                {/* SEKCE pro ODESÍLÁNÍ ZPRÁV - MAXIMÁLNÍ POTLAČENÍ FOCUS STYLŮ */}
                                <div ref={chatContainerRef} className="flex gap-2 flex-shrink-0">
                                    <Input
                                        type="text"
                                        placeholder={t.writeMessage}
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                        // Všechny třídy pro potlačení modrého okraje/stínu
                                        className="bg-white border text-black flex-grow focus:outline-none focus:border-gray-300 focus:shadow-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none"
                                    />
                                    <Button
                                        // Všechny třídy pro potlačení modrého okraje/stínu
                                        className="bg-blue-600 text-white hover:bg-blue-700 font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none"
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim() || chatLoading}
                                    >
                                        {t.send}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* --- SEZNAM ÚČASTNÍKŮ --- */}
                        {session && !targetProfile && (
                            <div className="animate-fade-in h-full flex flex-col">
                                <div className="flex flex-col md:flex-row gap-4 mb-6 flex-shrink-0">
                                    <Input
                                        type="text"
                                        placeholder={t.searchPlaceholder}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        // Všechny třídy pro potlačení modrého okraje/stínu
                                        className="bg-white border text-black flex-grow focus:outline-none focus:border-gray-300 focus:shadow-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none"
                                    />

                                    <Button
                                        onClick={handleLogout}
                                        disabled={loading}
                                        // Všechny třídy pro potlačení modrého okraje/stínu
                                        className="md:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold flex-shrink-0 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
                                    >
                                        {loading ? t.loggingOut : t.logout}
                                    </Button>
                                </div>
                                
                                <div className="flex-grow overflow-y-auto">
                                    {loading && profiles.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">{t.loadingList}</p>
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
                                                                ({t.me})
                                                            </span>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                {p.unreadCount > 0 && (
                                                                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-600 text-white text-xs font-bold shadow-md animate-pulse">
                                                                        {p.unreadCount}
                                                                    </span>
                                                                )}

                                                                <Button
                                                                    // Všechny třídy pro potlačení modrého okraje/stínu
                                                                    className="bg-green-600 text-white hover:bg-green-700 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
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
                                </div>
                            </div>
                        )}

                        {/* --- PŘIHLAŠOVACÍ FORMULÁŘ --- */}
                        {!session && (
                            <div className="max-w-md mx-auto py-12">
                                <p className="text-gray-500 text-center mb-6">{t.loginNotice}</p>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        type="email"
                                        placeholder="email@domain.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        // Všechny třídy pro potlačení modrého okraje/stínu
                                        className="bg-white border text-black flex-grow focus:outline-none focus:border-gray-300 focus:shadow-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none"
                                    />
                                    <Button
                                        onClick={sendMagicLink}
                                        disabled={loading || !email}
                                        // Všechny třídy pro potlačení modrého okraje/stínu
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl h-12 w-full transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
                                    >
                                        {loading ? t.sending : t.sendLink}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}