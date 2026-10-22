"use client";

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useLessonStore } from '@/store/useLessonStore';

export interface WordBlock {
  id: string;
  text: string;
  pinyin: string;
}

export const SentenceReorder = ({ initialWords, correctOrderIds, onCorrect }: { initialWords: WordBlock[], correctOrderIds: string[], onCorrect: () => void }) => {
  const [items, setItems] = useState<WordBlock[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  // Fix hydration issues with react-beautiful-dnd forks
  useEffect(() => {
    setItems(initialWords);
    setIsClient(true);
  }, [initialWords]);

  const addXP = useLessonStore(state => state.addXP);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);

    // Check correctness
    const currentOrderIds = newItems.map(item => item.id);
    if (JSON.stringify(currentOrderIds) === JSON.stringify(correctOrderIds)) {
      addXP(10);
      onCorrect();
    }
  };

  if (!isClient) return null;

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-3xl shadow-xl border border-slate-100">
      <h3 className="text-xl font-bold text-slate-700 mb-6 text-center">Sắp xếp các từ sau thành câu hoàn chỉnh</h3>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sentence" direction="horizontal">
          {(provided, snapshot) => (
            <div 
              ref={provided.innerRef} 
              {...provided.droppableProps} 
              className={`flex flex-wrap gap-4 p-6 min-h-[120px] rounded-2xl border-2 border-dashed transition-colors ${snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}
            >
              {items.map((word, index) => (
                <Draggable key={word.id} draggableId={word.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`px-6 py-4 rounded-xl font-bold text-2xl cursor-grab active:cursor-grabbing flex flex-col items-center justify-center transition-shadow ${snapshot.isDragging ? 'bg-blue-600 text-white shadow-2xl scale-110' : 'bg-white text-slate-800 shadow-md hover:shadow-lg border border-slate-200'}`}
                      style={{ ...provided.draggableProps.style }}
                    >
                      <span className={`text-sm mb-1 ${snapshot.isDragging ? 'text-blue-200' : 'text-slate-400'}`}>{word.pinyin}</span>
                      <span>{word.text}</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
