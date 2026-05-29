import SidebarChatItem from './SidebarChatItem'
import { FAKE_RECENT_CHATS } from '../../utils/constants'

const grouped = FAKE_RECENT_CHATS.reduce((acc, chat) => {
  if (!acc[chat.date]) acc[chat.date] = []
  acc[chat.date].push(chat)
  return acc
}, {})
const DATE_GROUPS = Object.entries(grouped)

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        data-testid="sidebar"
        className={`
          fixed md:relative z-30 md:z-auto
          flex flex-col h-full w-64 shrink-0
          bg-[#f9f9f9] dark:bg-[#171717]
          border-r border-black/5 dark:border-white/5
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top: New Chat */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <button
            aria-label="New chat"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors w-full"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M37.532 16.87a9.963 9.963 0 00-.856-8.184 10.078 10.078 0 00-10.855-4.835 9.964 9.964 0 00-7.505-3.360 10.079 10.079 0 00-9.612 6.977 9.967 9.967 0 00-6.664 4.834 10.08 10.08 0 001.24 11.817 9.965 9.965 0 00.856 8.185 10.079 10.079 0 0010.855 4.835 9.965 9.965 0 007.504 3.360 10.078 10.078 0 009.617-6.981 9.967 9.967 0 006.663-4.834 10.079 10.079 0 00-1.243-11.814zM22.498 37.886a7.474 7.474 0 01-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 00.655-1.134V19.054l3.366 1.944a.12.12 0 01.066.092v9.299a7.505 7.505 0 01-7.49 7.496zM6.392 31.006a7.471 7.471 0 01-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 001.308 0l9.724-5.614v3.888a.12.12 0 01-.048.103L16.520 33.6a7.505 7.505 0 01-10.128-2.594zM4.297 13.62A7.469 7.469 0 018.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 00.654 1.132l9.723 5.614-3.366 1.944a.12.12 0 01-.114.012L7.044 23.541a7.504 7.504 0 01-2.747-9.921zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 01.114-.012l8.048 4.648a7.498 7.498 0 01-1.158 13.528v-9.476a1.293 1.293 0 00-.647-1.13zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 00-1.308 0l-9.723 5.614v-3.888a.12.12 0 01.048-.103l8.051-4.645a7.497 7.497 0 0111.133 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 01-.065-.092v-9.299a7.497 7.497 0 0112.293-5.756 6.94 6.94 0 00-.236.134l-7.965 4.6a1.294 1.294 0 00-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.497v4.993l-4.330 2.501-4.332-2.497V18z" fill="currentColor"/>
            </svg>
            <span className="font-medium">ChatGPT</span>
          </button>

          <button
            aria-label="New chat"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
            Search chats
          </button>
        </div>

        {/* Recent chats */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
          {DATE_GROUPS.map(([label, chats]) => (
            <div key={label}>
              <p className="px-3 py-1 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
              <div className="space-y-0.5">
                {chats.map(chat => (
                  <SidebarChatItem key={chat.id} chat={chat} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: user */}
        <div className="border-t border-black/5 dark:border-white/5 px-3 py-3">
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
              P
            </div>
            <span className="truncate">Preetha</span>
          </button>
        </div>
      </aside>
    </>
  )
}
