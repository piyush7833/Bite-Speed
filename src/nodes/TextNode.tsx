import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface TextNodeData {
  text: string;
}

/**
 * TextNode - Custom chat message node component
 * 
 * Design: Chat bubble style with teal header and message content
 * Handles: Orange (left) for incoming, Green (right) for outgoing connections
 * Selection: Shows blue border when selected for editing
 */
const TextNode: React.FC<NodeProps<TextNodeData>> = ({ data, selected }) => {
  return (
          <div 
      className={`shadow-lg rounded-lg bg-white border-2 min-w-[200px] max-w-[250px] ${
        selected ? 'border-blue-500' : 'border-gray-200' // Blue border when selected
      }`}
    >
      {/* Orange handle for incoming connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 !bg-orange-500 border-2 border-white"
        style={{ left: -8 }}
        isConnectable={true} // Allow connections
      />
      
      {/* Header */}
      <div className="bg-teal-100 px-3 py-2 rounded-t-lg border-b border-teal-200 flex items-center gap-2">
        {/* Chat icon */}
        <div className="w-4 h-4 text-teal-600">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-sm font-medium text-teal-800">Send Message</span>
      </div>
      
      {/* Content */}
      <div className="p-3">
        <div className="text-sm text-gray-800 leading-relaxed">
          {data?.text || 'textNode'} {/* Show text or fallback */}
        </div>
      </div>
      
      {/* Green handle for outgoing connections */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 !bg-green-500 border-2 border-white"
        style={{ right: -8 }}
        isConnectable={true} // Allow connections
      />
    </div>
  );
};

export default TextNode;
