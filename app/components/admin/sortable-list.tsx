'use client';

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

type SortableListProps<T extends { id: number }> = {
  items: T[];
  onReorder: (next: T[]) => void | Promise<void>;
  renderItem: (item: T) => React.ReactNode;
  hint?: string;
};

function SortableRow({
  id,
  children
}: {
  id: number;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`admin-list-item admin-sortable-row${
        isDragging ? ' admin-sortable-row-dragging' : ''
      }`}
    >
      <button
        type="button"
        className="admin-drag-handle"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <div className="admin-sortable-body">{children}</div>
    </div>
  );
}

export function SortableList<T extends { id: number }>({
  items,
  onReorder,
  renderItem,
  hint = 'Drag the handle to reorder'
}: SortableListProps<T>) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const activeItem = activeId
    ? items.find((item) => item.id === activeId)
    : undefined;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(Number(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    void onReorder(arrayMove(items, oldIndex, newIndex));
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <div className="admin-sortable">
      <p className="admin-hint">{hint}</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="admin-list">
            {items.map((item) => (
              <SortableRow key={item.id} id={item.id}>
                {renderItem(item)}
              </SortableRow>
            ))}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
          {activeItem ? (
            <div className="admin-list-item admin-sortable-row admin-sortable-row-overlay">
              <span className="admin-drag-handle" aria-hidden>
                ⋮⋮
              </span>
              <div className="admin-sortable-body">{renderItem(activeItem)}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
