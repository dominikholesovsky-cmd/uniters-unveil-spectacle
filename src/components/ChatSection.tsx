import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

export default function ChatSection() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [targetProfile, setTargetProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Načtení session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener?.subscription.unsubscribe();
  }, []);

  // Odeslání magic linku
  const sendMagicLink = async () => {
    if (!email) return;
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: import.meta.env.VITE_SUPABASE_REDIRECT_URL },
    });
    if (error) setMessage(`Chyba: ${error.message}`);
    else setMessage("Magic link byl odeslán na váš email.");
    setLoading(false);
  };

  // Načtení profilů a nepřečtených zpráv
  const loadProfiles = useCallback(async () => {
    if (!session?.user?.id) return;
    setProfiles([]);
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
    const { data } = await supabase.from("messages").select("*").eq("chat_id", chatId).order("created_at", { ascending: true });
    setMessages(data || []);
    setChatLoading(false);
    scrollToBottom();

    // Označit zprávy jako přečtené
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

  if (!session?.user) {
    return (
      <div className="p-4 border rounded max-w-md mx-auto mt-6">
        <h2 className="text-lg font-bold mb-2">Přihlášení do chatu</h2>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Váš email"
          className="mb-2"
        />
        <Button onClick={sendMagicLink} disabled={!email || loading} className="w-full">
          {loading ? "Odesílám..." : "Odeslat magic link"}
        </Button>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex h-[80vh] border rounded">
      {/* Sidebar */}
      <div className="w-64 border-r p-2 flex flex-col">
        <Input placeholder="Hledat..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mb-2" />
        {profiles.length === 0 ? <p>Načítám...</p> : (
          <ul className="flex-grow overflow-y-auto divide-y">
            {filteredProfiles.map(p => (
              <li key={p.id} className="flex justify-between items-center py-2">
                <span>{p.name} {p.company && `(${p.company})`}</span>
                <Button onClick={() => startChat(p)}>
                  Chat {p.unreadCount > 0 && `(${p.unreadCount})`}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col p-2">
        {targetProfile ? (
          <>
            <div className="flex justify-between items-center border-b p-2">
              <h2>Chat s {targetProfile.name}</h2>
              <Button onClick={() => setTargetProfile(null)}>Zpět</Button>
            </div>
            <div className="flex-grow overflow-y-auto p-2 bg-gray-100 rounded mb-2">
              {chatLoading ? <p>Načítám chat...</p> : messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_id === session.user.id ? "justify-end" : "justify-start"} mb-1`}>
                  <div className={`p-2 rounded-xl max-w-xs ${msg.sender_id === session.user.id ? "bg-blue-600 text-white" : "bg-white"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <Input value={messageInput} onChange={e => setMessageInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Napište zprávu..." />
              <Button onClick={sendMessage}>Odeslat</Button>
            </div>
          </>
        ) : (
          <p>Vyberte profil pro zahájení chatu.</p>
        )}
      </div>
    </div>
  );
}
