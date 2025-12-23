import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatSectionProps {
  language?: "cs" | "en";
}

interface Profile {
  id: string;
  email: string;
  name: string;
  company?: string;
  unreadCount: number;
}

interface Message {
  id: number;
  chat_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const getChatId = (id1: string, id2: string) => [id1, id2].sort().join("_");

export default function ChatSection({ language = "cs" }: ChatSectionProps) {
  const t = {
    cs: {
      login: "Přihlaste se do chatu (magic link).",
      search: "Hledat...",
      loading: "Načítám...",
      chat: "Chat",
      chatWith: "Chat s",
      back: "Zpět",
      loadingChat: "Načítám chat...",
      writeMessage: "Napište zprávu...",
      send: "Odeslat",
      selectProfile: "Vyberte profil pro zahájení chatu.",
    },
    en: {
      login: "Please login to chat (magic link).",
      search: "Search...",
      loading: "Loading...",
      chat: "Chat",
      chatWith: "Chat with",
      back: "Back",
      loadingChat: "Loading chat...",
      writeMessage: "Write a message...",
      send: "Send",
      selectProfile: "Select a profile to start chatting.",
    },
  }[language];
  const [session, setSession] = useState<any>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [targetProfile, setTargetProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Načtení session z URL (magic link) nebo z localStorage
  useEffect(() => {
    // čekáme, až Supabase zpracuje token z URL
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener?.subscription.unsubscribe();
  }, []);

  // Načtení profilů a nepřečtených zpráv
  const loadProfiles = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const currentUserId = session.user.id;

    const { data: profilesData } = await supabase.from("profiles").select("*");
    const { data: unreadData } = await supabase
      .from("messages")
      .select("sender_id")
      .eq("recipient_id", currentUserId)
      .eq("is_read", false);

    const unreadMap = (unreadData || []).reduce((acc: Record<string, number>, msg: { sender_id: string }) => {
      acc[msg.sender_id] = (acc[msg.sender_id] || 0) + 1;
      return acc;
    }, {});

    const profilesWithUnread = (profilesData || []).map(p => ({ ...p, unreadCount: unreadMap[p.id] || 0 }));
    setProfiles(profilesWithUnread);
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    loadProfiles();

    const currentUserId = session.user.id;
    const channel = supabase.channel(`notifications_${currentUserId}`);
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${currentUserId}` },
      () => loadProfiles()
    ).subscribe();

    return () => supabase.removeChannel(channel);
  }, [session, loadProfiles]);

  // Načtení zpráv chatu
  const loadMessages = useCallback(async (profile: Profile) => {
    if (!session?.user?.id) return;
    const currentUserId = session.user.id;
    const chatId = getChatId(currentUserId, profile.id);

    setChatLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setChatLoading(false);
    scrollToBottom();

    await supabase.from("messages").update({ is_read: true })
      .eq("sender_id", profile.id)
      .eq("recipient_id", currentUserId)
      .eq("is_read", false);

    const channel = supabase.channel(`chat_${chatId}`);
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
      (payload) => setMessages(prev => [...prev, payload.new as Message])
    ).subscribe();

    return () => supabase.removeChannel(channel);
  }, [session]);

  const startChat = async (profile: Profile) => {
    setTargetProfile(profile);
    await loadMessages(profile);
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !targetProfile || !session?.user) return;
    const currentUserId = session.user.id;
    const chatId = getChatId(currentUserId, targetProfile.id);

    await supabase.from("messages").insert([{
      chat_id: chatId,
      sender_id: currentUserId,
      recipient_id: targetProfile.id,
      content: messageInput.trim(),
      is_read: false,
    }]);

    setMessageInput("");
  };

  const filteredProfiles = profiles.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  if (!session?.user) return <p className="text-center text-white/70">{t.login}</p>;

  return (
    <div className="flex h-[60vh] border border-white/20 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm">
      <div className="w-64 border-r border-white/20 p-3 flex flex-col">
        <Input placeholder={t.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mb-3 bg-white/10 border-white/20 text-white placeholder:text-white/50" />
        {loading ? <p className="text-white/70">{t.loading}</p> : (
          <ul className="flex-grow overflow-y-auto divide-y divide-white/10">
            {filteredProfiles.map(p => (
              <li key={p.id} className="flex justify-between items-center py-2">
                <span className="text-white text-sm">{p.name} {p.company && <span className="text-white/60">({p.company})</span>}</span>
                <Button size="sm" variant="secondary" onClick={() => startChat(p)}>
                  {t.chat} {p.unreadCount > 0 && `(${p.unreadCount})`}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex-1 flex flex-col p-3">
        {targetProfile ? (
          <>
            <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-3">
              <h2 className="text-white font-medium">{t.chatWith} {targetProfile.name}</h2>
              <Button size="sm" variant="outline" onClick={() => setTargetProfile(null)}>{t.back}</Button>
            </div>
            <div className="flex-grow overflow-y-auto p-3 bg-white/10 rounded-lg mb-3">
              {chatLoading ? <p className="text-white/70">{t.loadingChat}</p> : messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_id === session.user.id ? "justify-end" : "justify-start"} mb-2`}>
                  <div className={`p-2 px-3 rounded-xl max-w-xs ${msg.sender_id === session.user.id ? "bg-primary text-primary-foreground" : "bg-white/20 text-white"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <Input value={messageInput} onChange={e => setMessageInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder={t.writeMessage} className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
              <Button onClick={sendMessage}>{t.send}</Button>
            </div>
          </>
        ) : (
          <p className="text-white/70 text-center mt-8">{t.selectProfile}</p>
        )}
      </div>
    </div>
  );
}
