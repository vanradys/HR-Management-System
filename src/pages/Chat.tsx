import { useState, useEffect } from "react";
import { Search, Send, Megaphone, Users, MoreVertical } from "lucide-react";

const users = [
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

export default function Chat() {
  const [message, setMessage] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [activeRoom, setActiveRoom] = useState<RoomType>("private");
  const [selectedUser, setSelectedUser] = useState(users[0]);

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
    activeRoom === "private" ? selectedUser.name : activeRoom;

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

  const headerTitle =
    activeRoom === "announcement"
      ? "Announcement"
      : activeRoom === "group"
      ? "Group Divisi"
      : selectedUser.name;

  const headerSubtitle =
    activeRoom === "announcement"
      ? "Pengumuman perusahaan"
      : activeRoom === "group"
      ? "Engineering, Production, HRD"
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
              onClick={() => setActiveRoom("group")}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left ${
                activeRoom === "group" ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <Users className="w-5 h-5 text-blue-500" />

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Group Divisi
                </p>
                <p className="text-xs text-gray-500">
                  Engineering, Production, HRD
                </p>
              </div>
            </button>

            <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
              {users
                .filter((user) =>
                  user.name.toLowerCase().includes(searchUser.toLowerCase())
                )
                .map((user, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedUser(user);
                      setActiveRoom("private");
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
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#001E8A] text-white flex items-center justify-center font-bold">
                {headerAvatar}
              </div>

              <div>
                <h2 className="font-bold text-gray-900 text-lg">
                  {headerTitle}
                </h2>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${headerStatusColor}`}
                  />
                  <p className="text-xs text-gray-500">{headerSubtitle}</p>
                </div>
              </div>
            </div>

            <MoreVertical className="w-5 h-5 text-gray-500" />
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50">
            <div className="flex justify-center">
              <span className="px-4 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded-full">
                Hari ini
              </span>
            </div>

            {visibleMessages.map((msg) => {
              const isMe = msg.sender === "me";

              return (
                <div
                  key={msg.id}
                  className={isMe ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      isMe
                        ? "max-w-[70%] rounded-2xl rounded-br-sm px-4 py-3 text-sm bg-[#001E8A] text-white shadow-sm"
                        : "max-w-[70%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm bg-white text-gray-800 border border-gray-100 shadow-sm"
                    }
                  >
                    <p>{msg.text}</p>

                    <p
                      className={
                        isMe
                          ? "text-[10px] mt-1 text-blue-100"
                          : "text-[10px] mt-1 text-gray-400"
                      }
                    >
                      {msg.time} {isMe && "✓✓"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 flex gap-3 bg-white">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Tulis pesan..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
            />

            <button
              onClick={sendMessage}
              className="px-6 py-3 rounded-xl bg-[#001E8A] text-white font-semibold hover:bg-blue-900 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Kirim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}