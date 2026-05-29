export default function PresetQuestion({ question, onClick }) {
  return (
    <button
      onClick={() => onClick(question.title)}
      className="
        flex flex-col items-start gap-1 px-4 py-3 rounded-2xl text-left w-full
        border border-black/10 dark:border-white/10
        bg-black/5 dark:bg-white/5
        hover:bg-black/10 dark:hover:bg-white/10
        transition-colors
      "
    >
      <span className="text-lg leading-none">{question.icon}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">{question.title}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{question.subtitle}</span>
    </button>
  )
}
