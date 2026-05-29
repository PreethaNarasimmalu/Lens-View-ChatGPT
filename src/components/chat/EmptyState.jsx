import PresetQuestion from './PresetQuestion'
import { PRESET_QUESTIONS } from '../../utils/constants'

export default function EmptyState({ onPresetClick }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 pb-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            What can I help with?
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_QUESTIONS.map(q => (
            <PresetQuestion key={q.id} question={q} onClick={onPresetClick} />
          ))}
        </div>
      </div>
    </div>
  )
}
