import { useState, useEffect } from "react";
import {
  Search,
  Send,
  Megaphone,
  Users,
  MoreVertical,
  Plus,
  X,
} from "lucide-react";

const initialUsers = [
  { name: "Hafidz", status: "Online", color: "bg-green-500", unread: 2 },
  { name: "Dika", status: "Online", color: "bg-green-500", unread: 1 },
  { name: "Sakti", status: "Offline", color: "bg-gray-400", unread: 0 },
  { name: "Nanda", status: "Online", color: "bg-green-500", unread: 0 },
  { name: "Rizky", status: "Online", color: "bg-green-500", unread: 0 },
];

type RoomType = "private" | "group" | "announcement";

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
  const [message, setMessage] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [activeRoom, setActiveRoom] = useState<RoomType>("private");
  const [selectedGroupId, setSelectedGroupId] = useState("group");
  const [chatFilter, setChatFilter] = useState<
  "all" | "unread" | "favorites" | "groups"
  >("all");
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showNewFilterModal, setShowNewFilterModal] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");
  const [customFilters, setCustomFilters] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([
    {
      id: "group",
      name: "Group Divisi",
      members: ["Hafidz", "Dika", "Sakti"],
      unread: 0,
      favorite: false,
    },
  ]);
  const [chatUsers, setChatUsers] = useState(initialUsers);
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

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chat-messages", JSON.stringify(messages));
  }, [messages]);

  const currentRoomId =
  activeRoom === "private"
    ? selectedUser.name
    : activeRoom === "group"
    ? selectedGroupId
    : activeRoom;

  const visibleMessages = messages.filter(
    (msg) => msg.roomId === currentRoomId
  );

const sendMessage = () => {
  if (!message.trim()) return;

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
  setActiveRoom("group");
};

const createCustomFilter = () => {
  if (!newFilterName.trim()) return;

  setCustomFilters((prev) => [...prev, newFilterName.trim()]);
  setNewFilterName("");
  setShowNewFilterModal(false);
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 h-full">
        {/* Sidebar */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
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

          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">

            {[
              { key: "all", label: "All" },
              { key: "unread", label: "Unread" },
              { key: "favorites", label: "Favorites" },
              { key: "groups", label: "Groups" },
              ...customFilters.map((filter) => ({
                key: filter.toLowerCase().replace(/\s+/g, "-"),
                label: filter,
              })),
            ].map((tab) => (
              
              <button
                key={tab.key}
                onClick={() => setChatFilter(tab.key as any)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border ${
                  chatFilter === tab.key
                    ? "bg-[#001E8A] text-white border-[#001E8A]"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                {tab.label}
              </button>

            ))}

            <button
              onClick={() => setShowNewFilterModal(true)}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>

          </div>

          <div className="p-3 space-y-2">
            <button
              onClick={() => setActiveRoom("announcement")}
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

            <button
              onClick={() => setShowNewGroupModal(true)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left ${
                activeRoom === "group" ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
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

            <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
            {groups.map((group) => (
  <button
    key={group.id}
    onClick={() => {
      setActiveRoom("group");
      setSelectedGroupId(group.id);
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
              {chatUsers
                 .filter((user) =>
                  user.name.toLowerCase().includes(searchUser.toLowerCase())
                )
                .map((user, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedUser({ ...user, unread: 0 });
                      setActiveRoom("private");

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
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </p>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`w-2 h-2 rounded-full ${user.color}`}
                        />
                        <p className="text-xs text-gray-500">{user.status}</p>
                      </div>
                    </div>

                    {user.unread > 0 && (
                      <div className="min-w-[22px] h-6 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                        {user.unread}
                      </div>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
<div className="lg:col-span-3 bg-white border border-gray-100 rounded-[28px] shadow-sm flex flex-col overflow-hidden">

  {/* Header */}
  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
    
    <div className="flex items-center gap-3">

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
      </div>
    </div>

    <MoreVertical className="w-5 h-5 text-gray-400" />
  </div>

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

{showNewFilterModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-5">

      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Add New Filter
      </h2>

      <input
        value={newFilterName}
        onChange={(e) => setNewFilterName(e.target.value)}
        placeholder="Nama filter"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#001E8A]"
      />

      <div className="flex items-center justify-end gap-3 mt-5">

        <button
          onClick={() => {
            setShowNewFilterModal(false);
            setNewFilterName("");
          }}
          className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          onClick={createCustomFilter}
          className="px-5 py-2 rounded-xl bg-[#001E8A] text-white hover:bg-[#00166b]"
        >
          Save
        </button>

      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
}