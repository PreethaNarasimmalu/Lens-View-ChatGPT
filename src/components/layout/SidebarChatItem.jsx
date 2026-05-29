export default function SidebarChatItem({ chat, active = false }) {
  return (
    <button
      className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors group
        ${active
          ? 'bg-white/10 text-white'
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      <span className="truncate block">{chat.title}</span>
    </button>
  )
}
