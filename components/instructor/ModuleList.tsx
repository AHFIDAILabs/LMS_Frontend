import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import ModuleCard from '../instructor/ModuleCard'

export default function ModuleList({ modules, setModules }: any) {
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = modules.findIndex((m: any) => m._id === active.id)
      const newIndex = modules.findIndex((m: any) => m._id === over.id)
      const newOrder = arrayMove(modules, oldIndex, newIndex)
      setModules(newOrder)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={modules.map((m: any) => m._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {modules.map((module: any) => (
            <ModuleCard key={module._id} module={module} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
