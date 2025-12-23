import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- Supabase konfigurace ---
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

interface Profile {
  id: string;
  email: string;
  name: string;
  company: string | null;
  unreadCount: number;
}

interface Message {
  id: number;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  chat_id: string;
}

interface ChatSectionProps {
  language: "cs" | "en";
}

const getChatId = (id1: string, id2: string): string => {
  const sortedIds = [id1, id2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

export function ChatSection({ language }: ChatSectionProps) {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<any>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [targetProfile, setTargetProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const content = {
    cs: {
      sectionTitle: "Chat s účastníky",
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
      sectionTitle: "Chat with Participants",
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
  };

  const t = content[language];

  const markMessagesAsRead = useCallback(async (senderId: string) => {
    const currentUserId = session?.user?.id;
    if (!currentUserId) return;

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("sender_id", senderId)
      .eq("recipient_id", currentUserId)
      .eq("is_read", false);
  }, [session]);

  const loadProfiles = useCallback(async (currentUserId: string | null = session?.user?.id) => {
    setLoading(true);

    const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("*");

    if (profilesError) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    if (!currentUserId) {
      setProfiles(profilesData || []);
      setLoading(false);
      return;
    }

    const { data: unreadData } = await supabase
      .from("messages")
      .select("sender_id")
      .eq("recipient_id", currentUserId)
      .eq("is_read", false);

    const unreadMap = (unreadData || []).reduce((acc: Record<string, number>, msg: { sender_id: string }) => {
      acc[msg.sender_id] = (acc[msg.sender_id] || 0) + 1;
      return acc;
    }, {});

    const profilesWithUnread: Profile[] = (profilesData || []).map(p => ({
      ...p,
      unreadCount: unreadMap[p.id] || 0,
    }));

    const sorted = profilesWithUnread.sort((a, b) => {
      const aCompany = a.company || "";
      const bCompany = b.company || "";
      return aCompany.toLowerCase().localeCompare(bCompany.toLowerCase());
    });

    setProfiles(sorted);
    setLoading(false);
  }, [session?.user?.id]);

  const linkProfileToAuth = useCallback(async (user: any) => {
    if (!user.email) return;

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('email', user.email);

    const profileData = profilesData?.[0];

    if (profileData) {
      if (!profileData.id || profileData.id !== user.id) {
        await supabase
          .from('profiles')
          .update({ id: user.id })
          .eq('email', user.email);
      }
    } else {
      await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          name: user.email.split('@')[0],
          company: language === "cs" ? 'Nový Uživatel' : 'New User'
        });
    }

    loadProfiles(user.id);
  }, [loadProfiles, language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    setSession(null);
    setProfiles([]);
    setSearchQuery('');
    setTargetProfile(null);
  };

  const sendMagicLink = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: REDIRECT_URL },
    });
    setLoading(false);
    if (error) {
      alert(t.emailFailed);
    } else {
      alert(t.emailSent);
    }
  };

  const startChat = (target: Profile) => {
    setTargetProfile(target);
    setMessages([]);
    markMessagesAsRead(target.id);
    loadProfiles();
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !targetProfile || !session?.user) return;
    const currentUserId = session.user.id;
    const chatId = getChatId(currentUserId, targetProfile.id);
    const content = messageInput.trim();
    setMessageInput("");

    await supabase.from("messages").insert([{
      chat_id: chatId,
      sender_id: currentUserId,
      recipient_id: targetProfile.id,
      content,
      is_read: false,
    }]);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      setSession(session);
      if (session?.user) {
        linkProfileToAuth(session.user);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        linkProfileToAuth(session.user);
      } else {
        setProfiles([]);
        setTargetProfile(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [linkProfileToAuth]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase.channel(`notifications_${session.user.id}`);
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${session.user.id}` },
        () => loadProfiles()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, loadProfiles]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!targetProfile || !session?.user) return;

    const currentUserId = session.user.id;
    const chatId = getChatId(currentUserId, targetProfile.id);
    setChatLoading(true);

    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      setChatLoading(false);
      scrollToBottom();
    };

    loadMessages();

    const channel = supabase.channel(`chat_${chatId}`);
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetProfile, session]);

  const filteredProfiles = profiles.filter(p => {
    const query = searchQuery.toLowerCase();
    const nameMatch = p.name ? p.name.toLowerCase().includes(query) : false;
    const companyMatch = p.company ? p.company.toLowerCase().includes(query) : false;
    return nameMatch || companyMatch;
  });

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4">
        {session ? t.listTitle : t.loginTitle}
      </h2>

      {/* Chat s konkrétním účastníkem */}
      {session && targetProfile && (
        <div className="flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4 pb-3 border-b">
            <h3 className="text-lg font-bold">
              {t.chatWith} <span className="text-blue-600">{targetProfile.name}</span>
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setTargetProfile(null)}
            >
              {t.backToList}
            </Button>
          </div>

          <div className="flex-grow overflow-y-auto mb-4 p-4 space-y-4 bg-gray-100 rounded-lg">
            {chatLoading ? (
              <p className="text-center text-gray-500">{t.loadingChat}</p>
            ) : (
              messages.map((msg, index) => {
                const currentUserId = session.user.id;
                return (
                  <div key={index} className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}>
                    <div className={`p-3 max-w-xs rounded-xl shadow-md ${msg.sender_id === currentUserId
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-tl-none border"}`}>
                      <p className="text-sm break-words">{msg.content}</p>
                      <span className={`text-xs block text-right mt-1 ${msg.sender_id === currentUserId ? "text-blue-200" : "text-gray-500"}`}>
                        {new Date(msg.created_at).toLocaleTimeString(language)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={t.writeMessage}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-grow bg-white text-gray-900"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || chatLoading}
            >
              {t.send}
            </Button>
          </div>
        </div>
      )}

      {/* Seznam účastníků */}
      {session && !targetProfile && (
        <div className="flex flex-col h-[400px]">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button
              onClick={handleLogout}
              disabled={loading}
              variant="destructive"
              size="sm"
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
                    <li key={p.id} className="py-3 px-1 flex justify-between items-center hover:bg-gray-50 rounded-md">
                      <div>
                        <span className="font-medium text-gray-800">{p.name}</span>
                        {p.company && (
                          <span className="text-sm text-gray-500 ml-2">({p.company})</span>
                        )}
                      </div>
                      {isCurrentUser ? (
                        <span className="text-gray-500 text-sm font-semibold">({t.me})</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {p.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-600 text-white text-xs font-bold">
                              {p.unreadCount}
                            </span>
                          )}
                          <Button size="sm" onClick={() => startChat(p)}>
                            Chat
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

      {/* Přihlašovací formulář */}
      {!session && (
        <div className="max-w-md mx-auto">
          <p className="text-gray-500 text-center mb-4">{t.loginNotice}</p>
          <div className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              onClick={sendMagicLink}
              disabled={loading || !email}
              className="w-full"
            >
              {loading ? t.sending : t.sendLink}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatSection;
