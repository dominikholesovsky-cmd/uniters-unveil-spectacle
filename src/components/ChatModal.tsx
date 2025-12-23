import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const REDIRECT_URL = import.meta.env.VITE_SUPABASE_REDIRECT_URL;

if (!REDIRECT_URL) {
  throw new Error("VITE_SUPABASE_REDIRECT_URL není nastaven");
}

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

interface ChatModalProps {
  language?: "cs" | "en";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTotalUnreadChange?: (count: number) => void;
}

const MAGIC_LINK_OPENED_KEY = "chat_modal_opened_after_magic_link";

const getChatId = (id1: string, id2: string): string => {
  const sortedIds = [id1, id2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

export function ChatModal({
  language = "cs",
  open,
  onOpenChange,
  onTotalUnreadChange,
}: ChatModalProps) {
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

  const t = content[language] ?? content.cs;

  useEffect(() => {
    if (onTotalUnreadChange) onTotalUnreadChange(totalUnreadCount);
  }, [totalUnreadCount, onTotalUnreadChange]);

  const markMessagesAsRead = useCallback(
    async (senderId: string) => {
      const currentUserId = session?.user?.id;
      if (!currentUserId) return;
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("sender_id", senderId)
        .eq("recipient_id", currentUserId)
        .eq("is_read", false);
    },
    [session]
  );

  const loadProfiles = useCallback(
    async (currentUserId: string | null = session?.user?.id) => {
      setLoading(true);

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

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

      const { data: unreadData } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("recipient_id", currentUserId)
        .eq("is_read", false);

      let newTotalUnreadCount = 0;

      const unreadMap = (unreadData || []).reduce(
        (acc: Record<string, number>, msg: { sender_id: string }) => {
          acc[msg.sender_id] = (acc[msg.sender_id] || 0) + 1;
          newTotalUnreadCount += 1;
          return acc;
        },
        {}
      );

      setTotalUnreadCount(newTotalUnreadCount);

      const profilesWithUnread: Profile[] = (profilesData || []).map((p) => ({
        ...p,
        unreadCount: unreadMap[p.id] || 0,
      }));

      const sorted = profilesWithUnread.sort((a, b) => {
        const aCompany = a.company || "";
        const bCompany = b.company || "";
        const companyCompare = aCompany
          .toLowerCase()
          .localeCompare(bCompany.toLowerCase());
        if (companyCompare !== 0) return companyCompare;
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });

      setProfiles(sorted);
      setLoading(false);
    },
    [session?.user?.id]
  );

  const linkProfileToAuth = useCallback(
    async (user: any) => {
      if (!user.email) return;

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("email", user.email);

      const profileData = profilesData?.[0];

      if (profileData) {
        if (!profileData.id || profileData.id !== user.id) {
          await supabase
            .from("profiles")
            .update({ id: user.id })
            .eq("email", user.email);
        }
      } else {
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          name: user.email.split("@")[0],
          company: language === "cs" ? "Nový Uživatel" : "New User",
        });
      }

      loadProfiles(user.id);
    },
    [loadProfiles, language]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    setSession(null);
    setProfiles([]);
    setSearchQuery("");
    setTargetProfile(null);
    setTotalUnreadCount(0);
  };

  const sendMagicLink = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: REDIRECT_URL },
    });
    setLoading(false);
    if (error) alert(t.emailFailed);
    else alert(t.emailSent);
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

    await supabase.from("messages").insert([
      {
        chat_id: chatId,
        sender_id: currentUserId,
        recipient_id: targetProfile.id,
        content,
        is_read: false,
      },
    ]);
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
      else {
        setProfiles([]);
        setTargetProfile(null);
        localStorage.removeItem(MAGIC_LINK_OPENED_KEY);
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, [linkProfileToAuth]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase.channel(`notifications_${session.user.id}`);
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${session.user.id}`,
        },
        () => loadProfiles()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [session?.user?.id, loadProfiles]);

  useEffect(() => scrollToBottom(), [messages]);

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
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [targetProfile, session]);

  const filteredProfiles = profiles.filter((p) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(query);
    const companyMatch = p.company?.toLowerCase().includes(query);
    return nameMatch || companyMatch;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-6 sm:p-8 overflow-y-auto bg-white text-gray-900 flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-3 mb-4">
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
            {session ? t.listTitle : t.loginTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto">
          {/* Chat / List / Login */}
          {/* ... sem vlož render kódu z původního ChatModalu ... */}
          {/* Tento blok může zůstat beze změny */}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ChatModal;
