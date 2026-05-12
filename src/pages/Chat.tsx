import { useState, useEffect } from "react";
import { Search, Send, Megaphone, Users } from "lucide-react";

const users = [
  {
    name: "Hafidz",
    status: "Online",
    color: "bg-green-500",
    unread: 2,
  },

  {
    name: "Agil",
    status: "Busy",
    color: "bg-red-500",
    unread: 0,
  },

  {
    name: "Sakti",
    status: "Meeting",
    color: "bg-blue-500",
    unread: 5,
  },

  {
    name: "Dika",
    status: "Idle",
    color: "bg-yellow-400",
    unread: 1,
  },
];

export default function Chat() {
  const [message, setMessage] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [selectedUser, setSelectedUser] = useState(users[0]);
  const [activeRoom, setActiveRoom] = useState("chat");
  const [messages, setMessages] = useState([
  {
    text: "Revisi drawing conveyor sudah saya lanjutkan.",
    sender: "other",
    time: "09:15",
  },

  {
    text: "Oke, nanti update progress di laporan harian ya.",
    sender: "me",
    time: "09:17",
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

  const sendMessage = () => {
  if (!message.trim()) return;

  const newMessage = {
    text: message,
    sender: "me",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  setMessages([...messages, newMessage]);

  setMessage("");
};

  return (
    <div className="p-6 h-[calc(100vh-80px)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 h-full">

        {/* Sidebar */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

          <div className="p-4 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">
              Chat
            </h1>

            <p className="text-sm text-gray-500">
              Komunikasi internal perusahaan
            </p>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Cari chat..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
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
    activeRoom === "group"
      ? "bg-blue-50"
      : "hover:bg-gray-50"
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

            {users
              .filter((user) =>
                user.name.toLowerCase().includes(searchUser.toLowerCase())
              )
              .map((user, index) => (

  <button
  key={index}
  onClick={() => setSelectedUser(user)}
  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left ${
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
    <span className={`w-2 h-2 rounded-full ${user.color}`} />

    <p className="text-xs text-gray-500">
      {user.status}
    </p>
  </div>
</div>

{user.unread > 0 && (
  <div className="min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
    {user.unread}
  </div>
)}

</button>
))}

          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">

          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">

            <div className="w-11 h-11 rounded-full bg-[#001E8A] text-white flex items-center justify-center font-bold">
              {activeRoom === "announcement"
                ? "📢"
                : activeRoom === "group"
                ? "👥"
                : selectedUser.name.charAt(0)}
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                {activeRoom === "announcement"
                    ? "Announcement"
                    : activeRoom === "group"
                    ? "Group Divisi"
                    : selectedUser.name}
              </h2>

              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${selectedUser.color}`} />

                <p className="text-xs text-gray-500">
                  {activeRoom === "announcement"
                    ? "Pengumuman Perusahaan"
                    : activeRoom === "group"
                    ? "Engineering, Production, HRD"
                    : selectedUser.status}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-gray-50">

              <div className="max-w-[70%] rounded-2xl px-4 py-3 text-sm bg-white text-gray-800 border border-gray-100 rounded-bl-sm">
                <p>
                  Revisi drawing conveyor sudah saya lanjutkan.
                </p>

                <p className="text-[10px] mt-1 text-gray-400">
                  09:15
                </p>
              </div>
            </div>

            {messages.map((msg, index) => {
  const isMe = msg.sender === "me";

  return (
    <div
      key={index}
      className={isMe ? "flex justify-end" : "flex justify-start"}
    >
      <div
        className={
          isMe
            ? "max-w-[70%] rounded-2xl rounded-br-sm px-4 py-3 text-sm bg-[#001E8A] text-white"
            : "max-w-[70%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm bg-white text-gray-800 border border-gray-100"
        }
      >
        <p>{msg.text}</p>

        <p className={isMe ? "text-[10px] mt-1 text-blue-100" : "text-[10px] mt-1 text-gray-400"}>
          {msg.time}
        </p>
      </div>
    </div>
  );
})}

          {/* Input */}
          <div className="p-4 border-t border-gray-100 flex gap-3">

            <input
  value={message}
  onChange={(e) => setMessage(e.target.value)}

  onKeyDown={(e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  }}

  placeholder="Tulis pesan..."
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