import EmptyState from './EmptyState'

export default function ChatArea({ onPresetClick }) {
  return (
    <div
      data-testid="chat-area"
      className="flex-1 overflow-y-auto flex flex-col"
    >
      <EmptyState onPresetClick={onPresetClick} />
    </div>
  )
}
