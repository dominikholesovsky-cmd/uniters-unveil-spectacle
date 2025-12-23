import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const REDIRECT_URL = import.meta.env.VITE_SUPABASE_REDIRECT_URL || window.location.origin + "/portal";

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

interface DbProfile {
  id: string;
  email: string;
  name: string;
  company: string | null;
  created_at: string;
}

interface DbMessage {
  id: number;
  chat_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ChatModalProps {
  language?: "cs" | "en";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTotalUnreadChange?: (count: number) => void;
}

const getChatId = (id1: string, id2: string) => [id1, id2].sort().join("_");

export function ChatModal({ language = "cs", open, onOpenChange, onTotalUnreadChange }: ChatModalProps) {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<any>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [targetProfile, setTargetProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const content = {
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
  };

  const t = content[language];

  useEffect(() => {
    if (onTotalUnreadChange) onTotalUnreadChange(totalUnreadCount);
  }, [totalUnreadCount, onTotalUnreadChange]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const markMessagesAsRead = useCallback(async (senderId: string) => {
    const currentUserId = session?.user?.id;
    if (!currentUserId) return;
    await (supabase.from("messages") as any).update({ is_read: true })
      .eq("sender_id", senderId)
      .eq("recipient_id", currentUserId)
      .eq("is_read", false);
  }, [session]);

  const loadProfiles = useCallback(async () => {
    const currentUserId = session?.user?.id;
    if (!currentUserId) return;

    setLoading(true);
    const { data: profilesData } = await (supabase.from("profiles") as any).select("*") as { data: DbProfile[] | null };
    const { data: unreadData } = await (supabase.from("messages") as any).select("sender_id").eq("recipient_id", currentUserId).eq("is_read", false) as { data: { sender_id: string }[] | null };

    const unreadMap = (unreadData || []).reduce((acc: Record<string, number>, msg) => {
      acc[msg.sender_id] = (acc[msg.sender_id] || 0) + 1;
      return acc;
    }, {});

    const profilesWithUnread: Profile[] = (profilesData || []).map(p => ({ 
      id: p.id,
      email: p.email,
      name: p.name,
      company: p.company,
      unreadCount: unreadMap[p.id] || 0 
    }));
    const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);
    setTotalUnreadCount(totalUnread);

    setProfiles(profilesWithUnread.sort((a, b) => (a.company || "").localeCompare(b.company || "")));
    setLoading(false);
  }, [session?.user?.id]);

  const linkProfileToAuth = useCallback(async (user: any) => {
    if (!user.email) return;
    const { data: profilesData } = await (supabase.from('profiles') as any).select('id').eq('email', user.email) as { data: { id: string }[] | null };
    if (profilesData?.[0]) {
      if (profilesData[0].id !== user.id) await (supabase.from('profiles') as any).update({ id: user.id }).eq('email', user.email);
    } else {
      await (supabase.from('profiles') as any).insert({ id: user.id, email: user.email, name: user.email.split('@')[0], company: language === "cs" ? "Nový Uživatel" : "New User" });
    }
    loadProfiles();
  }, [loadProfiles, language]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !targetProfile || !session?.user) return;
    const currentUserId = session.user.id;
    const chatId = getChatId(currentUserId, targetProfile.id);
    await (supabase.from("messages") as any).insert([{
      chat_id: chatId,
      sender_id: currentUserId,
      recipient_id: targetProfile.id,
      content: messageInput.trim(),
      is_read: false,
    }]);
    setMessageInput("");
  };

  const sendMagicLink = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: REDIRECT_URL } });
    setLoading(false);
    alert(error ? t.emailFailed : t.emailSent);
  };

  const startChat = (profile: Profile) => {
    setTargetProfile(profile);
    setMessages([]);
    markMessagesAsRead(profile.id);
    loadProfiles();
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setProfiles([]);
    setTargetProfile(null);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      setSession(session);
      if (session?.user) linkProfileToAuth(session.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) linkProfileToAuth(session.user);
      else setProfiles([]);
    });

    return () => listener?.subscription.unsubscribe();
  }, [linkProfileToAuth]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const currentUserId = session.user.id;

    const channel = supabase.channel(`notifications_${currentUserId}`);
    channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${currentUserId}` }, () => loadProfiles()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session, loadProfiles]);

  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    if (!targetProfile || !session?.user) return;
    const currentUserId = session.user.id;
    const chatId = getChatId(currentUserId, targetProfile.id);
    setChatLoading(true);

    const loadMessages = async () => {
      const { data } = await (supabase.from("messages") as any).select("*").eq("chat_id", chatId).order("created_at", { ascending: true }) as { data: DbMessage[] | null };
      setMessages((data || []) as Message[]);
      setChatLoading(false);
      scrollToBottom();
    };

    loadMessages();

    const channel = supabase.channel(`chat_${chatId}`);
    channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` }, (payload) => setMessages(prev => [...prev, payload.new as Message])).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [targetProfile, session]);

  const filteredProfiles = profiles.filter(p => {
    const q = searchQuery.toLowerCase();
    return (p.name?.toLowerCase().includes(q) || p.company?.toLowerCase().includes(q));
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-6 overflow-y-auto flex flex-col">
        <DialogHeader><DialogTitle>{session ? t.listTitle : t.loginTitle}</DialogTitle></DialogHeader>

        {session && targetProfile && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 border-b">
              <h2>{t.chatWith} {targetProfile.name}</h2>
              <Button onClick={() => setTargetProfile(null)}>{t.backToList}</Button>
            </div>

            <div className="flex-grow overflow-y-auto mb-4 p-4 bg-gray-100 rounded">
              {chatLoading ? <p>{t.loadingChat}</p> : messages.map((msg, idx) => {
                const currentUserId = session.user.id;
                return (
                  <div key={idx} className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}>
                    <div className={`p-3 max-w-xs rounded-xl ${msg.sender_id === currentUserId ? "bg-blue-600 text-white" : "bg-white"}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <Input value={messageInput} onChange={e => setMessageInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendMessage()} placeholder={t.writeMessage} />
              <Button onClick={handleSendMessage}>{t.send}</Button>
            </div>
          </div>
        )}

        {session && !targetProfile && (
          <div className="flex flex-col h-full">
            <div className="flex mb-4 gap-4">
              <Input placeholder={t.searchPlaceholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <Button onClick={handleLogout}>{loading ? t.loggingOut : t.logout}</Button>
            </div>
            <ul className="overflow-y-auto flex-grow divide-y">
              {filteredProfiles.map(p => (
                <li key={p.id} className="flex justify-between py-2">
                  <span>{p.name} {p.company && `(${p.company})`}</span>
                  <Button onClick={() => startChat(p)}>Chat {p.unreadCount > 0 && `(${p.unreadCount})`}</Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!session && (
          <div className="max-w-md mx-auto py-6">
            <p>{t.loginNotice}</p>
            <Input placeholder="email@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
            <Button onClick={sendMagicLink}>{loading ? t.sending : t.sendLink}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ChatModal;
