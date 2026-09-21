'use client';

import { useState } from 'react';

type SortableListProps<T extends { id: number }> = {
  items: T[];
  onReorder: (next: T[]) => void | Promise<void>;
  renderItem: (
    item: T,
    handle: { draggable: boolean; onDragStart: () => void }
  ) => React.ReactNode;
  hint?: string;
};

export function SortableList<T extends { id: number }>({
  items,
  onReorder,
  renderItem,
  hint = 'Drag the handle to reorder'
}: SortableListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function reorder(from: number, to: number) {
    if (from === to || from < 0 || to < 0) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    void onReorder(next);
  }

  return (
    <div className="admin-sortable">
      <p className="admin-hint">{hint}</p>
      <div className="admin-list">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`admin-list-item admin-sortable-row${
              dragIndex === index ? ' admin-sortable-row-active' : ''
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) reorder(dragIndex, index);
              setDragIndex(null);
            }}
          >
            <button
              type="button"
              className="admin-drag-handle"
              draggable
              aria-label="Drag to reorder"
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => setDragIndex(null)}
            >
              ⋮⋮
            </button>
            <div className="admin-sortable-body">
              {renderItem(item, {
                draggable: false,
                onDragStart: () => setDragIndex(index)
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
