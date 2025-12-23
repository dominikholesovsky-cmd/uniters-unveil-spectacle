import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  currentUserId: string;
}

const getChatId = (id1: string, id2: string) => {
  const sortedIds = [id1, id2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

export function ChatSection({ currentUserId }: ChatSectionProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [targetProfile, setTargetProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadProfiles = useCallback(async () => {
    setLoadingProfiles(true);

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      console.error("Chyba při načítání profilů:", profilesError.message);
      setProfiles([]);
      setLoadingProfiles(false);
      return;
    }

    const { data: unreadData } = await supabase
      .from("messages")
      .select("sender_id")
      .eq("recipient_id", currentUserId)
      .eq("is_read", false);

    const unreadMap = (unreadData || []).reduce(
      (acc: Record<string, number>, msg: { sender_id: string }) => {
        acc[msg.sender_id] = (acc[msg.sender_id] || 0) + 1;
        return acc;
      },
      {}
    );

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
    setLoadingProfiles(false);
  }, [currentUserId]);

  const loadMessages = useCallback(
    async (profileId: string) => {
      setChatLoading(true);
      const chatId = getChatId(currentUserId, profileId);

      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      setMessages(data || []);
      setChatLoading(false);
      scrollToBottom();

      // Označení jako přečtené
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("chat_id", chatId)
        .eq("recipient_id", currentUserId)
        .eq("is_read", false);
    },
    [currentUserId]
  );

  const startChat = (profile: Profile) => {
    setTargetProfile(profile);
    loadMessages(profile.id);

    // Realtime listener
    const chatId = getChatId(currentUserId, profile.id);
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
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !targetProfile) return;

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
    loadProfiles();

    // Realtime listener pro nové zprávy do všech chatů
    const channel = supabase.channel(`notifications_${currentUserId}`);
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${currentUserId}`,
        },
        () => loadProfiles()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentUserId, loadProfiles]);

  useEffect(() => scrollToBottom(), [messages]);

  return (
    <div className="flex h-full border rounded overflow-hidden">
      <div className="w-1/3 border-r overflow-y-auto">
        {loadingProfiles ? (
          <div className="p-4 text-gray-500">Načítám seznam...</div>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile.id}
              className={`p-3 cursor-pointer hover:bg-gray-100 ${
                targetProfile?.id === profile.id ? "bg-gray-200" : ""
              }`}
              onClick={() => startChat(profile)}
            >
              <div className="font-semibold">{profile.name}</div>
              <div className="text-sm text-gray-500">{profile.company}</div>
              {profile.unreadCount > 0 && (
                <span className="text-xs text-white bg-red-500 rounded-full px-2 py-0.5">
                  {profile.unreadCount}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {targetProfile ? (
          <>
            <div className="flex-shrink-0 border-b p-3 font-semibold">
              Chat s {targetProfile.name}
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {chatLoading ? (
                <div className="text-gray-500">Načítám chat...</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-2 p-2 rounded ${
                      msg.sender_id === currentUserId
                        ? "bg-blue-100 text-right"
                        : "bg-gray-100 text-left"
                    }`}
                  >
                    {msg.content}
                  </div>
                ))
              )}
              <div ref={messagesEndRef}></div>
            </div>
            <div className="flex p-3 border-t">
              <Input
                className="flex-1 mr-2"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Napište zprávu..."
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>Odeslat</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Vyberte profil pro zahájení chatu
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatSection;
