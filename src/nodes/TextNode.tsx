import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// TypeScript interface defining the data structure for TextNode
export interface TextNodeData {
  text: string; // The message content displayed in the node
}

/**
 * Custom TextNode Component - Chat Message Style Node
 * 
 * Design Philosophy:
 * - Mimics a chat message interface with header and content sections
 * - Uses teal/green color scheme to represent message sending
 * - Provides visual feedback for selection state
 * 
 * React Flow Integration:
 * - Implements NodeProps interface for seamless React Flow integration
 * - Uses Handle components for connection points
 * - Supports custom styling while maintaining React Flow functionality
 * 
 * Connection Architecture:
 * - Left handle (target): Accepts multiple incoming connections
 * - Right handle (source): Limited to one outgoing connection (enforced in App.tsx)
 * 
 * Visual Features:
 * - Chat bubble appearance with header and body
 * - Selection highlighting with blue border
 * - Responsive width constraints
 * - Professional shadow and border styling
 */
const TextNode: React.FC<NodeProps<TextNodeData>> = ({ data, selected }) => {
  return (
    <div 
      className={`shadow-lg rounded-lg bg-white border-2 min-w-[200px] max-w-[250px] ${
        selected ? 'border-blue-500' : 'border-gray-200'
      }`}
    >
      {/* 
        Target Handle - Input Connection Point
        - Positioned on the left side of the node
        - Allows multiple nodes to connect TO this node
        - Blue color for visual consistency
        - Positioned outside the node boundary (left: -8px)
      */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 !bg-blue-500 border-2 border-white"
        style={{ left: -8 }}
        isConnectable={true}
      />
      
      {/* 
        Node Header - Chat Message Style
        - Teal background to represent message/communication
        - Contains chat icon and "Send Message" label
        - Rounded top corners to match overall node design
      */}
      <div className="bg-teal-100 px-3 py-2 rounded-t-lg border-b border-teal-200 flex items-center gap-2">
        {/* Chat/Message Icon - SVG */}
        <div className="w-4 h-4 text-teal-600">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-sm font-medium text-teal-800">Send Message</span>
      </div>
      
      {/* 
        Message Content Area
        - Displays the actual text content from node data
        - Padding for comfortable reading
        - Fallback to 'textNode' if no text provided
      */}
      <div className="p-3">
        <div className="text-sm text-gray-800 leading-relaxed">
          {data?.text || 'textNode'}
        </div>
      </div>
      
      {/* 
        Source Handle - Output Connection Point
        - Positioned on the right side of the node
        - This node can connect TO other nodes from here
        - Blue color matching the target handle
        - Positioned outside the node boundary (right: -8px)
        - Connection limit enforced in App.tsx (max 1 outgoing)
      */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 !bg-blue-500 border-2 border-white"
        style={{ right: -8 }}
        isConnectable={true}
      />
    </div>
  );
};

export default TextNode;
