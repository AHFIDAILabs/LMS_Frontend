import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronDown } from 'lucide-react'

export default function ModuleCard({ module }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: module._id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className="bg-slate-900 border border-gray-800 rounded-xl">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button {...attributes} {...listeners}>
            <GripVertical className="w-4 h-4 text-gray-500" />
          </button>
          <h3 className="text-white font-semibold">{module.title}</h3>
        </div>

        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>

      {/* Lessons go here next */}
    </div>
  )
}
