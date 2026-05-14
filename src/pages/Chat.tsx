import { useState, useEffect, type MouseEvent } from "react";
import {
  Search,
  Send,
  Megaphone,
  Users,
  MoreVertical,
  X,
  ArrowLeft,
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';

const initialUsers = [
  { name: "Hafidz", status: "Online", color: "bg-green-500", unread: 2, favorite: false },
  { name: "Dika", status: "Online", color: "bg-green-500", unread: 1, favorite: false },
  { name: "Sakti", status: "Offline", color: "bg-gray-400", unread: 0, favorite: false },
  { name: "Nanda", status: "Online", color: "bg-green-500", unread: 0, favorite: false },
  { name: "Rizky", status: "Online", color: "bg-green-500", unread: 0, favorite: false },
];

type RoomType = "empty" | "private" | "group" | "announcement";
type Message = {
  id: number;
  roomId: string;
  sender: "me" | "other";
  text: string;
  time: string;
};
type ChatGroup = {
  id: string;
  name: string;
  members: string[];
  unread: number;
  favorite: boolean;
};

export default function Chat() {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [searchUser, setSearchUser] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [activeRoom, setActiveRoom] = useState<RoomType>("empty");
  const [selectedGroupId, setSelectedGroupId] = useState("group");
  const [chatFilter, setChatFilter] = useState<
  "all" | "unread" | "favorites" | "groups"
  >("all");
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showEmptyScreen, setShowEmptyScreen] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [renameGroupName, setRenameGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedGroupMembersToAdd, setSelectedGroupMembersToAdd] = useState<string[]>([]);
  const [showGroupMembersModal, setShowGroupMembersModal] = useState(false);
  const [showGroupRenameModal, setShowGroupRenameModal] = useState(false);
  const [showGroupAddMemberModal, setShowGroupAddMemberModal] = useState(false);
  const [messageContextMenu, setMessageContextMenu] = useState<
    { messageId: number; x: number; y: number } | null
  >(null);
  const [groups, setGroups] = useState<ChatGroup[]>(() => {
  const savedGroups = localStorage.getItem("chat-groups");

  return savedGroups
    ? JSON.parse(savedGroups)
    : [
        {
          id: "group",
          name: "New Group",
          members: ["Hafidz", "Dika", "Sakti"],
          unread: 0,
          favorite: false,
        },
      ];
});
  const [chatUsers, setChatUsers] = useState(() => {
  const savedUsers = localStorage.getItem("chat-users");

  return savedUsers
    ? JSON.parse(savedUsers)
    : initialUsers;
});
const [activeChatNames, setActiveChatNames] = useState<string[]>([
  "Hafidz",
  "Dika",
]);
  const [selectedUser, setSelectedUser] = useState(initialUsers[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      roomId: "Hafidz",
      sender: "other",
      text: "Revisi drawing conveyor sudah saya lanjutkan.",
      time: "09:15",
    },
    {
      id: 2,
      roomId: "Hafidz",
      sender: "me",
      text: "Oke, nanti update progress di laporan harian ya.",
      time: "09:17",
    },
    {
      id: 3,
      roomId: "group",
      sender: "other",
      text: "Tim, jangan lupa update laporan harian sebelum pulang.",
      time: "10:05",
    },
    {
      id: 4,
      roomId: "announcement",
      sender: "other",
      text: "Pengumuman: Meeting koordinasi dilakukan pukul 14.00 WIB.",
      time: "11:20",
    },
  ]);

  useEffect(() => {
  const savedMessages = localStorage.getItem("chat-messages");
  const savedActiveUsers = localStorage.getItem("chat-active-users");

  if (savedMessages) {
    setMessages(JSON.parse(savedMessages));
  }



  if (savedActiveUsers) {
    setActiveChatNames(JSON.parse(savedActiveUsers));
  }
}, []);



useEffect(() => {
  localStorage.setItem(
    "chat-active-users",
    JSON.stringify(activeChatNames)
  );
}, [activeChatNames]);

useEffect(() => {
  localStorage.setItem(
    "chat-users",
    JSON.stringify(chatUsers)
  );
}, [chatUsers]);

useEffect(() => {
  localStorage.setItem(
    "chat-groups",
    JSON.stringify(groups)
  );
}, [groups]);
  useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowEmptyScreen(true);
      setMobileView("chat");
    }
  };

  window.addEventListener("keydown", handleEsc);

  return () => {
    window.removeEventListener("keydown", handleEsc);
  };
}, []);

  const currentRoomId =
  activeRoom === "private"
    ? selectedUser?.name
    : activeRoom === "group"
    ? selectedGroupId
    : activeRoom === "announcement"
    ? "announcement"
    : null;

  const visibleMessages = messages
    .filter((msg) => msg.roomId === currentRoomId)
    .filter((msg) =>
      messageSearch.trim()
        ? msg.text.toLowerCase().includes(messageSearch.toLowerCase())
        : true
    );

  const filteredGroups = groups.filter((group) => {
  if (chatFilter === "groups") return true;
  if (chatFilter === "unread") return group.unread > 0;
  if (chatFilter === "favorites") return group.favorite;

  return true;
});

const filteredUsers = chatUsers.filter((user) => {
  const matchSearch = user.name
    .toLowerCase()
    .includes(searchUser.toLowerCase());

  if (!matchSearch) return false;
  
  if (!activeChatNames.includes(user.name)) return false;

  if (chatFilter === "groups") return false;
  if (chatFilter === "unread") return user.unread > 0;
  if (chatFilter === "favorites") return user.favorite === true;

  return true;
});

const getLastMessage = (roomId: string) => {
  const roomMessages = messages.filter(
    (msg) => msg.roomId === roomId
  );

  return roomMessages[roomMessages.length - 1];
};

const sendMessage = () => {
  if (!message.trim() || !currentRoomId) return;

  const newMessage: Message = {
    id: Date.now(),
    roomId: currentRoomId,
    sender: "me",
    text: message,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  setMessages((prev) => [...prev, newMessage]);
  setMessage("");

  const replyTime = new Date(Date.now() + 1200).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (currentRoomId === "announcement") {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          roomId: "announcement",
          sender: "other",
          text: "Pengumuman baru: tim akan mengadakan briefing siang ini.",
          time: replyTime,
        },
      ]);

      toast({
        title: "Pengumuman baru",
        description: "Ada pengumuman terbaru di channel Announcement.",
      });
    }, 1400);
  } else if (activeRoom === "private") {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          roomId: selectedUser.name,
          sender: "other",
          text: `Terima kasih, saya akan cek dan balas segera.`,
          time: replyTime,
        },
      ]);

      toast({
        title: `Pesan dari ${selectedUser.name}`,
        description: "Anda menerima balasan baru di chat privat.",
      });
    }, 1200);
  } else if (activeRoom === "group") {
    const group = groups.find((g) => g.id === selectedGroupId);
    const replyFrom = group?.members[0] || "Tim";

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          roomId: selectedGroupId,
          sender: "other",
          text: `${replyFrom}: Terima kasih, saya sedang follow up sekarang.`,
          time: replyTime,
        },
      ]);

      toast({
        title: `Pesan baru di ${group?.name ?? "grup"}`,
        description: "Ada pesan baru dari anggota grup.",
      });
    }, 1200);
  }
};

const convertMessageToTask = (messageId: number) => {
  const sourceMessage = messages.find((msg) => msg.id === messageId);
  if (!sourceMessage) return;

  toast({
    title: "Pesan dikonversi",
    description: `Pesan "${sourceMessage.text.slice(0, 40)}" berhasil diubah menjadi tugas.`,
  });
  setMessageContextMenu(null);
};

const handleMessageContextMenu = (
  e: MouseEvent<HTMLDivElement>,
  messageId: number
) => {
  e.preventDefault();
  setMessageContextMenu({
    messageId,
    x: e.clientX,
    y: e.clientY,
  });
};

const createGroup = () => {
  if (!newGroupName.trim()) return;

  const newGroup: ChatGroup = {
    id: `group-${Date.now()}`,
    name: newGroupName,
    members: selectedMembers,
    unread: 0,
    favorite: false,
  };

  setGroups((prev) => [...prev, newGroup]);
  setNewGroupName("");
  setSelectedMembers([]);
  setShowNewGroupModal(false);
  setSelectedGroupId(newGroup.id);
  setActiveRoom("group");
  setMobileView("chat");
  setShowEmptyScreen(false);
};



const addChatToFavorites = () => {
  if (activeRoom !== "private") return;

  setChatUsers((prev) =>
    prev.map((user) =>
      user.name === selectedUser.name
        ? { ...user, favorite: true }
        : user
    )
  );
};

  const selectedGroup = groups.find(
    (group) => group.id === selectedGroupId
  );

  const headerTitle =
    activeRoom === "announcement"
      ? "Announcement"
      : activeRoom === "group"
      ? selectedGroup?.name || "Group"
      : selectedUser.name;

  const headerSubtitle =
    activeRoom === "announcement"
      ? "Pengumuman perusahaan"
      : activeRoom === "group"
      ? selectedGroup?.members.join(", ") || "Anggota grup"
      : selectedUser.status;

  const headerAvatar =
    activeRoom === "announcement"
      ? "📢"
      : activeRoom === "group"
      ? "👥"
      : selectedUser.name.charAt(0);

  const headerStatusColor =
    activeRoom === "private" ? selectedUser.color : "bg-green-500";

  return (
    <div className="p-6 h-[calc(100vh-80px)] bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] gap-5 h-full">
        {/* Sidebar */}
        <div
          className={`bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden ${
            mobileView === "chat"
              ? "hidden md:block"
              : "block"
          }`}
  
        >
          <div className="p-4 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">Chat</h1>
            <p className="text-sm text-gray-500">
              Komunikasi internal perusahaan
            </p>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Cari chat..."
                className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-3 px-1">

            {[
              { key: "all", label: "All" },
              { key: "unread", label: "Unread" },
              { key: "favorites", label: "Favorites" },
              { key: "groups", label: "Groups" },
              
            ].map((tab) => (
              
              <button
                key={tab.key}
                onClick={() => {
                  setShowChatMenu(false);
                  setChatFilter(tab.key as any);
                }}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border ${
                  chatFilter === tab.key
                    ? "bg-[#001E8A] text-white border-[#001E8A]"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                {tab.label}
              </button>

            ))}

         
          </div>


          <div className="p-3 pt-5 space-y-2">
            {chatFilter === "all" && (
              <button
                onClick={() => {
                setShowChatMenu(false);
                setActiveRoom("announcement");
                setMobileView("chat");
                setShowEmptyScreen(false);
              }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left ${
                  activeRoom === "announcement"
                    ? "bg-red-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <Megaphone className="w-5 h-5 text-red-500" />

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Announcement
                  </p>
                  <p className="text-xs text-gray-500">
                    Pengumuman perusahaan
                  </p>
                </div>
              </button>
            )}

            {chatFilter === "all" && (
  <button
    onClick={() => {
      setShowChatMenu(false);
      setShowNewGroupModal(true);
    }}
    className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-gray-50"
  >
    <Users className="w-5 h-5 text-blue-500" />

    <div>
      <p className="text-sm font-semibold text-gray-900">
        Grup Baru
      </p>

      <p className="text-xs text-gray-500">
        Buat grup baru
      </p>
    </div>
  </button>
)}

 {chatFilter === "all" && (
  <button
    onClick={() => {
      setShowChatMenu(false);
      setShowContactsModal(true);
    }}
    className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-gray-50"
  >
    <Users className="w-5 h-5 text-[#001E8A]" />

    <div>
      <p className="text-sm font-semibold text-gray-900">
        Kontak Internal
      </p>

      <p className="text-xs text-gray-500">
        Daftar karyawan internal
      </p>
    </div>
  </button>
)}

            <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
            {filteredGroups.map((group) => (
  <button
    key={group.id}
    onClick={() => {
      setShowChatMenu(false);
      setActiveRoom("group");
      setSelectedGroupId(group.id);
      setMobileView("chat");
      setShowEmptyScreen(false);
    }}
    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left ${
      activeRoom === "group" &&
      selectedGroupId === group.id
        ? "bg-blue-50"
        : "hover:bg-gray-50"
    }`}
  >
    <div className="w-10 h-10 rounded-full bg-[#001E8A] text-white flex items-center justify-center font-bold">
      👥
    </div>

    <div className="flex-1">
      <p className="text-sm font-semibold text-gray-900">
        {group.name}
      </p>

      <p className="text-xs text-gray-500">
        {group.members.length} anggota
      </p>
    </div>

    {group.unread > 0 && (
      <div className="min-w-[22px] h-6 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
        {group.unread}
      </div>
    )}
  </button>
))}
              {chatFilter !== "groups" && (
  <>
              {filteredUsers.map((user, index) => {
  const lastMessage = getLastMessage(user.name);
  return (
                <button
                  key={index}
                  onClick={() => {
                    setShowChatMenu(false);
                    setSelectedUser({ ...user, unread: 0 });
                    setActiveRoom("private");
                    setMobileView("chat");
                    setShowEmptyScreen(false);

                    setChatUsers((prev) =>
                      prev.map((item) =>
                        item.name === user.name
                          ? { ...item, unread: 0 }
                          : item
                      )
                    );
                  }}

                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left ${
                    activeRoom === "private" &&
                    selectedUser.name === user.name
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#001E8A] text-white flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>

                  <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.name}
                    </p>
                    {lastMessage && (
                      <p className="text-[11px] text-gray-400 whitespace-nowrap">
                        {lastMessage.time}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">

                    <span
                      className={`w-2 h-2 rounded-full ${user.color}`}
                    />

                    <p className="text-xs text-gray-500 truncate max-w-[160px]">
                      {lastMessage?.text || user.status}
                    </p>
                  </div>
                </div>

                  {user.unread > 0 && (
                    <div className="min-w-[22px] h-6 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                      {user.unread}
                    </div>
                  )}
                </button>
                  );
                })}
            </>
          )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
<div
  className={`bg-white border border-gray-100 rounded-[28px] shadow-sm flex flex-col overflow-hidden ${
    mobileView === "list"
      ? "hidden md:flex"
      : "flex"
  }`}
>

  {/* Header */}
  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">

    <div className="flex items-center gap-3">
  
      <button
      onClick={() => setMobileView("list")}
      className="md:hidden w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
    >
      <ArrowLeft className="w-6 h-6 text-gray-700" />
    </button>

      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-[#001E8A] text-white flex items-center justify-center font-bold text-lg">
          {headerAvatar}
        </div>

        <span
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${headerStatusColor}`}
        />
      </div>

      <div>
        <h2 className="font-bold text-gray-900 text-lg leading-tight">
          {headerTitle}
        </h2>

        <p className="text-sm text-gray-500">
          {headerSubtitle}
        </p>

        {activeRoom !== "empty" && (
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                placeholder="Cari pesan..."
                className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>

    <div className="relative">
  <button
    onClick={() => setShowChatMenu((prev) => !prev)}
    className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
  >
    <MoreVertical className="w-5 h-5 text-gray-400" />
  </button>

  {showChatMenu && (
    <>
      <button
        type="button"
        onClick={() => setShowChatMenu(false)}
        className="fixed inset-0 z-40 cursor-default"
        aria-label="Close chat menu"
      />

      <div className="absolute right-0 top-11 w-60 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">

        <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
          Chat Options
        </p>

        {activeRoom === "group" && (
          <>
            <button
              onClick={() => {
                setShowGroupMembersModal(true);
                setShowChatMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
            >
              Lihat Anggota
            </button>

            <button
              onClick={() => {
                setRenameGroupName(selectedGroup?.name ?? "");
                setShowGroupRenameModal(true);
                setShowChatMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
            >
              Rename Group
            </button>

            <button
              onClick={() => {
                setSelectedGroupMembersToAdd([]);
                setShowGroupAddMemberModal(true);
                setShowChatMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
            >
              Tambah Anggota
            </button>

            <button
              onClick={() => {
                if (selectedGroup) {
                  setGroups((prev) =>
                    prev.filter((group) => group.id !== selectedGroup.id)
                  );
                  setActiveRoom("empty");
                  setShowEmptyScreen(true);
                  setShowChatMenu(false);
                  toast({
                    title: "Keluar Grup",
                    description: `Anda keluar dari ${selectedGroup.name}.`,
                  });
                }
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
            >
              Keluar Grup
            </button>
          </>
        )}

        {activeRoom === "private" && (
          <button
            onClick={() => {
              setChatUsers((prev) =>
                prev.map((user) =>
                  user.name === selectedUser.name
                    ? {
                        ...user,
                        favorite: !user.favorite,
                      }
                    : user
                )
              );
              setShowChatMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
          >
            {selectedUser.favorite
              ? "Remove from Favorites"
              : "Add to Favorites"}
          </button>
        )}

      </div>
    </>
  )}
</div>
</div>

{showEmptyScreen ? (
  <div className="flex-1 flex items-center justify-center bg-[#f8fafc] px-6">
    <div className="w-full max-w-xl bg-white border border-gray-100 rounded-[32px] shadow-sm p-8">
      <p className="text-sm font-semibold text-[#001E8A] mb-2">
        Workspace
      </p>

      <h1 className="text-3xl font-bold text-gray-900 leading-tight">
        Hubungi Kontak Internal anda
        <br />
        atau lanjutkan pekerjaan
      </h1>

      <p className="text-gray-500 mt-3 leading-relaxed">
        Kelola komunikasi internal perusahaan, cek ringkasan pekerjaan,
        dan lanjutkan aktivitas harian anda.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <button className="rounded-2xl border border-gray-200 p-5 text-left hover:bg-gray-50 transition">
          <p className="text-sm font-semibold text-gray-900">
            To Do Lists
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Lanjutkan pekerjaan dan checklist harian
          </p>
        </button>

        <button className="rounded-2xl border border-gray-200 p-5 text-left hover:bg-gray-50 transition">
          <p className="text-sm font-semibold text-gray-900">
            Ringkasan Laporan Harian
          </p>

          <p className="text-xs text-gray-500 mt-1">
            3 pekerjaan sedang berjalan
          </p>
        </button>
      </div>
    </div>
  </div>
) : (
  <>
    {/* Messages */}
    <div className="flex-1 px-6 py-6 overflow-y-auto bg-white">
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="h-px bg-gray-100 flex-1" />

          <span className="text-xs text-gray-400">
            Hari ini
          </span>

          <div className="h-px bg-gray-100 flex-1" />
        </div>

        {visibleMessages.map((msg) => {
          const isMe = msg.sender === "me";

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                onContextMenu={(e) => handleMessageContextMenu(e, msg.id)}
                className={`relative max-w-[72%] px-5 py-4 text-sm shadow-sm ${
                  isMe
                    ? "bg-[#001E8A] text-white rounded-[24px] rounded-br-md"
                    : "bg-gray-100 text-gray-800 rounded-[24px] rounded-bl-md"
                }`}
              >
                <p className="leading-relaxed">
                  {msg.text}
                </p>

                <div
                  className={`mt-2 flex items-center justify-end gap-1 text-[10px] ${
                    isMe ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  <span>{msg.time}</span>

                  {isMe && <span>✓✓</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Input */}
    <div className="px-5 py-4 border-t border-gray-100 bg-white">
      <div className="flex items-center gap-3">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder="Tulis pesan..."
          className="flex-1 px-5 py-4 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#001E8A]"
        />

        <button
          onClick={sendMessage}
          className="w-14 h-14 rounded-2xl bg-[#001E8A] text-white flex items-center justify-center hover:bg-[#00166b]"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  </>
)}

{messageContextMenu && (
  <div
    style={{ left: messageContextMenu.x, top: messageContextMenu.y }}
    className="fixed z-50 w-48 rounded-2xl border border-gray-200 bg-white shadow-xl"
  >
    <button
      onClick={() => convertMessageToTask(messageContextMenu.messageId)}
      className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50"
    >
      Convert to task
    </button>
    <button
      onClick={() => setMessageContextMenu(null)}
      className="w-full px-4 py-3 text-left text-sm text-gray-500 hover:bg-gray-50"
    >
      Tutup
    </button>
  </div>
)}

</div>

{showNewGroupModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setShowNewGroupModal(false)}
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-gray-900">
          Grup Baru
        </h2>
      </div>

      <input
        value={newGroupName}
        onChange={(e) => setNewGroupName(e.target.value)}
        placeholder="Nama grup"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#001E8A] mb-4"
      />

      <p className="text-sm font-semibold text-gray-700 mb-2">
        Pilih anggota
      </p>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {chatUsers.map((user) => {
          const checked = selectedMembers.includes(user.name);

          return (
            <button
              key={user.name}
              onClick={() => {
                setShowChatMenu(false);
                setSelectedMembers((prev) =>
                  checked
                    ? prev.filter((name) => name !== user.name)
                    : [...prev, user.name]
                );
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border ${
                checked
                  ? "border-[#001E8A] bg-blue-50"
                  : "border-gray-100 hover:bg-gray-50"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-[#001E8A] text-white flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user.status}
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-full border ${
                  checked
                    ? "bg-[#001E8A] border-[#001E8A]"
                    : "border-gray-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      <button
        onClick={createGroup}
        disabled={
          !newGroupName.trim() ||
          selectedMembers.length < 2
        }
        className={`w-full mt-5 py-3 rounded-xl text-white font-semibold transition ${
          !newGroupName.trim() ||
          selectedMembers.length < 2
            ? "bg-[#001E8A]/40 cursor-not-allowed"
            : "bg-[#001E8A] hover:bg-[#00166b]"
        }`}
      >
        Buat Grup
      </button>

    </div>
  </div>
)}

{showGroupMembersModal && selectedGroup && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Anggota Grup</h2>
          <p className="text-sm text-gray-500">{selectedGroup.name}</p>
        </div>
        <button
          onClick={() => setShowGroupMembersModal(false)}
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        {selectedGroup.members.map((member) => (
          <div key={member} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-[#001E8A] text-white flex items-center justify-center font-bold">
              {member.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{member}</p>
              <p className="text-xs text-gray-500">Anggota grup</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

{showGroupRenameModal && selectedGroup && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setShowGroupRenameModal(false)}
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-gray-900">Rename Group</h2>
      </div>

      <input
        value={renameGroupName}
        onChange={(e) => setRenameGroupName(e.target.value)}
        placeholder="Nama grup baru"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#001E8A] mb-4"
      />

      <button
        onClick={() => {
          if (!selectedGroup || !renameGroupName.trim()) return;
          setGroups((prev) =>
            prev.map((group) =>
              group.id === selectedGroup.id
                ? { ...group, name: renameGroupName }
                : group
            )
          );
          setShowGroupRenameModal(false);
          toast({
            title: "Group renamed",
            description: `Nama grup diubah menjadi ${renameGroupName}.`,
          });
        }}
        className={`w-full mt-5 py-3 rounded-xl text-white font-semibold bg-[#001E8A] hover:bg-[#00166b]`}
      >
        Simpan
      </button>
    </div>
  </div>
)}

{showGroupAddMemberModal && selectedGroup && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Tambah Anggota</h2>
          <p className="text-sm text-gray-500">{selectedGroup.name}</p>
        </div>
        <button
          onClick={() => setShowGroupAddMemberModal(false)}
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {chatUsers
          .filter((user) => !selectedGroup.members.includes(user.name))
          .map((user) => {
            const checked = selectedGroupMembersToAdd.includes(user.name);
            return (
              <button
                key={user.name}
                onClick={() => {
                  setSelectedGroupMembersToAdd((prev) =>
                    checked
                      ? prev.filter((name) => name !== user.name)
                      : [...prev, user.name]
                  );
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border ${
                  checked
                    ? "border-[#001E8A] bg-blue-50"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#001E8A] text-white flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.status}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border ${checked ? "bg-[#001E8A] border-[#001E8A]" : "border-gray-300"}`} />
              </button>
            );
          })}
      </div>

      <button
        onClick={() => {
          if (!selectedGroup || selectedGroupMembersToAdd.length === 0) return;
          setGroups((prev) =>
            prev.map((group) =>
              group.id === selectedGroup.id
                ? {
                    ...group,
                    members: [...group.members, ...selectedGroupMembersToAdd],
                  }
                : group
            )
          );
          setSelectedGroupMembersToAdd([]);
          setShowGroupAddMemberModal(false);
          toast({
            title: "Anggota ditambahkan",
            description: `${selectedGroupMembersToAdd.length} anggota baru ditambahkan ke grup.`,
          });
        }}
        disabled={selectedGroupMembersToAdd.length === 0}
        className={`w-full mt-5 py-3 rounded-xl text-white font-semibold transition ${
          selectedGroupMembersToAdd.length === 0
            ? "bg-[#001E8A]/40 cursor-not-allowed"
            : "bg-[#001E8A] hover:bg-[#00166b]"
        }`}
      >
        Tambah Anggota
      </button>
    </div>
  </div>
)}

{showContactsModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5">

      <div className="flex items-center justify-between mb-5">

        <div>
          
          <h2 className="text-lg font-bold text-gray-900">
            Kontak Internal
          </h2>

          <p className="text-sm text-gray-500">
            Daftar karyawan internal
          </p>
        </div>

        <button
          onClick={() => setShowContactsModal(false)}
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">

        {[...chatUsers]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((user) => (

            <button
              key={user.name}
              onClick={() => {
                setShowChatMenu(false);

                if (!activeChatNames.includes(user.name)) {
                  setActiveChatNames((prev) => [
                    ...prev,
                    user.name,
                  ]);
                }

                setSelectedUser(user);
                setActiveRoom("private");
                setMobileView("chat");
                setShowEmptyScreen(false);
                setShowContactsModal(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left"
            >

              <div className="w-10 h-10 rounded-full bg-[#001E8A] text-white flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {user.name}
                </p>

                <p className="text-xs text-gray-500">
                  {user.status}
                </p>
              </div>

            </button>

        ))}

      </div>
    </div>
  </div>
)}
    </div>
  </div>
  );
}