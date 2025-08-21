import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { TextNodeData } from '../nodes/TextNode';

// TypeScript interface defining the props for SettingsPanel
interface SettingsPanelProps {
  selectedNode: Node<TextNodeData> | null; // Currently selected node (null if none selected)
  onNodeDataChange: (nodeId: string, data: TextNodeData) => void; // Callback to update node data
  onClose: () => void; // Callback to close the settings panel
}

/**
 * SettingsPanel Component - Right-Side Node Editor
 * 
 * Purpose:
 * - Provides an editing interface for selected nodes
 * - Appears on the right side when a node is selected
 * - Allows real-time editing of node properties
 * 
 * State Management:
 * - Maintains local state for immediate UI responsiveness
 * - Syncs changes back to the main application state via callbacks
 * - Automatically updates when a different node is selected
 * 
 * Design Philosophy:
 * - Clean, focused interface for editing
 * - Matches the overall chat theme with message icon
 * - Provides immediate feedback for user actions
 * - Non-intrusive close button for easy dismissal
 * 
 * Real-time Updates:
 * - Changes are applied immediately as user types
 * - No "save" button needed - auto-save behavior
 * - Visual synchronization with canvas nodes
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({
  selectedNode,
  onNodeDataChange,
  onClose,
}) => {
  // Local state for the text input
  // This provides immediate UI responsiveness while typing
  const [text, setText] = useState('');

  /**
   * Sync local state with selected node data
   * 
   * This effect runs whenever the selectedNode changes:
   * - When a new node is selected, load its text content
   * - When no node is selected, this component won't render
   * - Ensures the textarea always shows the current node's content
   */
  useEffect(() => {
    if (selectedNode) {
      setText(selectedNode.data?.text || '');
    }
  }, [selectedNode]);

  /**
   * Handle text input changes with real-time updates
   * 
   * This function:
   * 1. Updates local state immediately for responsive UI
   * 2. Calls the parent callback to update the main application state
   * 3. The updated data flows back to the canvas node through React Flow
   * 
   * Real-time Flow:
   * User types → Local state updates → Parent callback → Canvas updates
   * 
   * @param event - React change event from the textarea
   */
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    
    // Update local state for immediate UI feedback
    setText(newText);
    
    // Update the node data in the main application state
    if (selectedNode) {
      onNodeDataChange(selectedNode.id, { text: newText });
    }
  };

  // Don't render if no node is selected
  // This panel only appears when editing a specific node
  if (!selectedNode) {
    return null;
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200">
      {/* 
        Panel Header
        - Shows the context (editing a "Message" node)
        - Includes close button for easy dismissal
        - Uses chat icon to maintain theme consistency
      */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Header with Icon and Title */}
          <div className="flex items-center gap-2">
            {/* Message Icon - matches the node header */}
            <div className="w-5 h-5 text-blue-500">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Message</h3>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 
        Editing Content Area
        - Simple, clean layout focused on text editing
        - Textarea with proper styling and focus states
        - Auto-resize disabled to maintain consistent layout
        - Placeholder text provides guidance to users
      */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Input Label */}
          <label className="block text-sm font-medium text-gray-700">
            Text
          </label>
          
          {/* Text Input Area */}
          <textarea
            value={text}
            onChange={handleTextChange}
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            rows={6}
            placeholder="Enter your message..."
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
