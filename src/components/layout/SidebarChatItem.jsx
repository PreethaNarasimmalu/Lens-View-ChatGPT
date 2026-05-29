export default function SidebarChatItem({ chat, active = false }) {
  return (
    <button
      className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors
        ${active
          ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
        }`}
    >
      <span className="truncate block">{chat.title}</span>
    </button>
  )
}
