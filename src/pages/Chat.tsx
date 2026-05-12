import { useState } from "react";
import { Search, Send, Megaphone, Users } from "lucide-react";

type ChatUser = {
  id: string;
  name: string;
  role: string;
  status: "online" | "idle" | "offline" | "busy" | "meeting";
};

type Message = {
  id: string;
  senderId: string;
  text: string;
  time: string;
  read: boolean;
};

const users: ChatUser[] = [
  { id: "EMP001", name: "Admin HR", role: "Admin", status: "online" },
  { id: "EMP002", name: "Hafidz", role: "Engineering", status: "meeting" },
  { id: "EMP003", name: "Agil", role: "Production", status: "busy" },
  { id: "EMP004", name: "Sakti", role: "Purchasing", status: "idle" },
];

const statusConfig = {
  online: { label: "Online", color: "bg-green-500" },
  idle: { label: "Idle", color: "bg-yellow-400" },
  offline: { label: "Offline", color: "bg-gray-400" },
  busy: { label: "Busy", color: "bg-red-500" },
  meeting: { label: "Meeting", color: "bg-blue-500" },
};

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState<ChatUser>(users[1]);
  const [messageText, setMessageText] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "EMP002",
      text: "Revisi drawing conveyor sudah saya lanjutkan.",
      time: "09:15",
      read: true,
    },
    {
      id: "2",
      senderId: "EMP001",
      text: "Oke, nanti update progress di laporan harian ya.",
      time: "09:17",
      read: true,
    },
  ]);

  const sendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "EMP001",
      text: messageText,
      time: new Date().toTimeString().slice(0, 5),
      read: false,
    };

    setMessages([...messages, newMessage]);
    setMessageText("");
  };

  return (
    <div className="p-6 h-[calc(100vh-80px)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 h-full">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">Chat</h1>
            <p className="text-sm text-gray-500">Komunikasi internal karyawan</p>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Cari chat..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="p-3 space-y-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left">
              <Megaphone className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Announcement</p>
                <p className="text-xs text-gray-500">Pengumuman perusahaan</p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Group Divisi</p>
                <p className="text-xs text-gray-500">Engineering, Production, HR</p>
              </div>
            </button>

            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left ${
                  selectedUser.id === user.id ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#001E8A] text-white flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${statusConfig[user.status].color}`} />
                    <p className="text-xs text-gray-500">{statusConfig[user.status].label}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#001E8A] text-white flex items-center justify-center font-bold">
              {selectedUser.name.charAt(0)}
            </div>

            <div>
              <h2 className="font-bold text-gray-900">{selectedUser.name}</h2>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${statusConfig[selectedUser.status].color}`} />
                <p className="text-xs text-gray-500">{statusConfig[selectedUser.status].label}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-gray-50">
            {messages.map((msg) => {
              const isMe = msg.senderId === "EMP001";

              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                      isMe
                        ? "bg-[#001E8A] text-white rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                      {msg.time} {isMe ? (msg.read ? "✓✓ Dibaca" : "✓ Terkirim") : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-100 flex gap-3">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Tulis pesan..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
            />

            <button
              onClick={sendMessage}
              className="px-5 py-3 rounded-xl bg-[#E30613] text-white font-semibold hover:bg-red-700 flex items-center gap-2"
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