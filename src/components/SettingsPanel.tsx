import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { TextNodeData } from '../nodes/TextNode';

interface SettingsPanelProps {
  selectedNode: Node<TextNodeData> | null;
  onNodeDataChange: (nodeId: string, data: TextNodeData) => void;
  onClose: () => void;
}

/**
 * SettingsPanel - Right sidebar for editing selected nodes
 * 
 * Behavior: Only appears when exactly one node is selected
 * Real-time updates: Changes immediately sync to canvas node
 * State management: Local state + callback to parent for persistence
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({
  selectedNode,
  onNodeDataChange,
  onClose,
}) => {
  const [text, setText] = useState('');

  // Update text when node changes
  useEffect(() => {
    if (selectedNode) {
      setText(selectedNode.data?.text || ''); // Sync with selected node data
    }
  }, [selectedNode]);

  // Handle text changes with real-time updates
  // Updates local state immediately, then syncs to main app state via callback
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setText(newText); // Update local state for responsive UI
    
    if (selectedNode) {
      onNodeDataChange(selectedNode.id, { text: newText }); // Sync to canvas node
    }
  };

  if (!selectedNode) {
    return null;
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Title */}
          <div className="flex items-center gap-2">
            {/* Icon */}
            <div className="w-5 h-5 text-blue-500">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Message</h3>
          </div>
          
          {/* Close */}
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

      {/* Content */}
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
