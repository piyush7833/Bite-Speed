import React from 'react';

/**
 * NodesPanel - Left sidebar node palette
 * 
 * Purpose: Displays available node types that can be dragged onto canvas
 * Interaction: HTML5 drag & drop - stores node type in drag event data
 * Extensible: Easy to add more node types in the future
 */
const NodesPanel: React.FC = () => {
  // Handle drag start - stores node type for drop handler in App.tsx
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType); // Store node type
    event.dataTransfer.effectAllowed = 'move'; // Show move cursor
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Nodes Panel</h3>
      </div>
      
      <div className="p-4">
        {/* Message node preview */}
        <div
          className="bg-white rounded-lg border-2 border-blue-200 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors mb-4 relative"
          draggable={true} // Enable drag & drop
          onDragStart={(event) => onDragStart(event, 'textNode')}
        >
          {/* Orange handle - incoming */}
          <div 
            className="absolute w-4 h-4 bg-orange-500 border-2 border-white rounded-full"
            style={{ left: -8, top: '50%', transform: 'translateY(-50%)' }} // Center vertically, outside left edge
          />
          
          {/* Green handle - outgoing */}
          <div 
            className="absolute w-4 h-4 bg-green-500 border-2 border-white rounded-full"
            style={{ right: -8, top: '50%', transform: 'translateY(-50%)' }} // Center vertically, outside right edge
          />

          {/* Header */}
          <div className="bg-teal-100 px-3 py-2 rounded-t-lg border-b border-teal-200 flex items-center gap-2">
            {/* Chat icon */}
            <div className="w-4 h-4 text-teal-600">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-teal-800">Message</span>
          </div>
          
          {/* Instructions */}
          <div className="p-3">
            <div className="text-xs text-gray-500">
              Drag to add to canvas
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-6">
          More node types coming soon...
          {/* TODO: Add input node, decision node, etc. */}
        </div>
      </div>
    </div>
  );
};

export default NodesPanel;
