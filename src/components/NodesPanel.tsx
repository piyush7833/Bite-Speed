import React from 'react';

/**
 * NodesPanel Component - Left Sidebar Node Library
 * 
 * Purpose:
 * - Acts as a "palette" or "toolbox" of available node types
 * - Users drag nodes from here to the main canvas
 * - Provides visual preview of what each node type looks like
 * 
 * Drag & Drop Integration:
 * - Implements HTML5 drag & drop API
 * - Sets node type data in drag event for canvas to consume
 * - Provides visual feedback during drag operations
 * 
 * Design Philosophy:
 * - Matches the chat message theme of the application
 * - Shows exactly how nodes will appear on the canvas
 * - Clean, organized layout for easy node discovery
 * 
 * Extensibility:
 * - Designed to easily accommodate additional node types
 * - Each node type can have its own preview and drag behavior
 * - Maintains consistent styling across all node types
 */
const NodesPanel: React.FC = () => {
  /**
   * Handle drag start event for node types
   * 
   * This function is crucial for the drag & drop functionality:
   * 1. Sets the node type identifier in the drag event data
   * 2. Configures the drag effect as "move" (shows appropriate cursor)
   * 3. The data is later retrieved in App.tsx onDrop handler
   * 
   * @param event - React drag event containing drag state
   * @param nodeType - String identifier for the node type (e.g., 'textNode')
   */
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    // Store the node type in the drag event data
    // This will be retrieved when the node is dropped on the canvas
    event.dataTransfer.setData('application/reactflow', nodeType);
    
    // Set the visual drag effect to 'move' (shows move cursor)
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Nodes Panel</h3>
      </div>
      
      <div className="p-4">
        {/* 
          Message Node - Draggable Preview
          
          Design Notes:
          - Exact visual replica of how the node appears on canvas
          - Blue border indicates it's draggable/interactive
          - Hover effects provide user feedback
          - Cursor changes (grab -> grabbing) show drag state
          - Same styling as TextNode component for consistency
        */}
        <div
          className="bg-white rounded-lg border-2 border-blue-200 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors mb-4"
          draggable={true} // Enable HTML5 drag functionality
          onDragStart={(event) => onDragStart(event, 'textNode')} // Set drag data
        >
          {/* Node Header - matches TextNode component */}
          <div className="bg-teal-100 px-3 py-2 rounded-t-lg border-b border-teal-200 flex items-center gap-2">
            {/* Chat Icon - same as TextNode */}
            <div className="w-4 h-4 text-teal-600">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-teal-800">Message</span>
          </div>
          
          {/* Node Content Area with Instructions */}
          <div className="p-3">
            <div className="text-xs text-gray-500">
              Drag to add to canvas
            </div>
          </div>
        </div>
        
        {/* Future Expansion Placeholder */}
        <div className="text-xs text-gray-500 mt-6">
          More node types will be added in future updates.
        </div>
      </div>
    </div>
  );
};

export default NodesPanel;
