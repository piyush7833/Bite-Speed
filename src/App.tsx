import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  OnConnect,
  BackgroundVariant,
} from 'reactflow';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import TextNode, { TextNodeData } from './nodes/TextNode';
import NodesPanel from './components/NodesPanel';
import SettingsPanel from './components/SettingsPanel';
import { validateFlow, createFlowData } from './utils/validation';

// Define custom node types for React Flow
// Maps string identifiers to React components for rendering different node types
const nodeTypes: NodeTypes = {
  textNode: TextNode, // 'textNode' renders as our custom chat message component
};

// Initial empty state - no nodes or connections when app starts
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

/**
 * Main App Component - Chatbot Flow Builder
 * 
 * Architecture:
 * - Left panel: NodesPanel (drag source for new nodes)
 * - Center: React Flow canvas (main editing area)
 * - Right panel: SettingsPanel (appears when node selected)
 * 
 * Flow Logic:
 * - Each node can have max 1 outgoing connection (enforced in onConnect)
 * - Target handles accept multiple incoming connections
 * - Validation ensures single starting node before saving
 */
function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<TextNodeData> | null>(null);
  const [showSettings, setShowSettings] = useState(false); // Controls right panel visibility
  const reactFlowWrapper = useRef<HTMLDivElement>(null); // For drag & drop positioning
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Handle new connections between nodes
  // Business rule: each source handle can only have ONE outgoing connection
  // This creates a tree-like flow structure for chatbot conversations
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      // Check if source already has a connection
      const existingEdge = edges.find(edge => 
        edge.source === params.source && edge.sourceHandle === params.sourceHandle
      );

      if (existingEdge) {
        toast.error('Each node can only have one outgoing connection');
        return;
      }

      setEdges((eds: Edge[]) => addEdge(params, eds));
    },
    [edges, setEdges],
  );

  // Handle selection changes - show settings panel for single node selection
  // Right panel only appears when exactly one node is selected for editing
  const onSelectionChange = useCallback((params: { nodes: Node[]; edges: Edge[] }) => {
    if (params.nodes.length === 1) {
      setSelectedNode(params.nodes[0] as Node<TextNodeData>);
      setShowSettings(true);
    } else {
      setSelectedNode(null);
      setShowSettings(false);
    }
  }, []);

  // Handle drag & drop from nodes panel to canvas
  // Creates new node instances when dropped from the left panel
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds || !reactFlowInstance) return;

      // Get node type from drag data (set in NodesPanel)
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      // Convert screen coordinates to flow coordinates (accounts for pan/zoom)
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node<TextNodeData> = {
        id: `node-${Date.now()}`, // TODO: consider using uuid for production
        type,
        position,
        data: { text: 'Enter your message here' },
      };

      setNodes((nds: Node[]) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  // Allow dropping - required for HTML5 drag & drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Update node data from settings panel
  const handleNodeDataChange = useCallback((nodeId: string, data: TextNodeData) => {
    setNodes((nds: Node[]) =>
      nds.map((node: Node) => {
        if (node.id === nodeId) {
          return { ...node, data }; // Update only the data
        }
        return node;
      })
    );
  }, [setNodes]);

  // Close settings panel
  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
    setSelectedNode(null);
    setNodes((nds: Node[]) =>
      nds.map((node: Node) => ({ ...node, selected: false })) // Deselect all nodes
    );
  }, [setNodes]);

  const handleSave = useCallback(() => {
    const validation = validateFlow(nodes, edges);
    
    if (!validation.isValid) {
      toast.error(validation.errorMessage);
      return;
    }

    const flowData = createFlowData(nodes, edges); // Clean JSON for saving
    console.log('Flow saved successfully:', flowData);
    toast.success('Flow saved successfully! Check console for details.');
  }, [nodes, edges]);

  // Handle keyboard deletion of selected nodes and edges
  // Supports Delete/Backspace keys with proper input field detection
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only handle deletion keys
    if (event.key !== 'Delete' && event.key !== 'Backspace') {
      return;
    }

    // Don't delete if user is typing in an input field
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    )) {
      return; // User is typing, don't delete
    }

    event.preventDefault(); // Prevent browser back navigation

    const selectedNodes = nodes.filter(node => node.selected);
    const selectedEdges = edges.filter(edge => edge.selected);

    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      return; // Nothing selected
    }

    // Handle node deletion (also removes connected edges)
    if (selectedNodes.length > 0) {
      const nodeIds = selectedNodes.map(node => node.id);
      
      setNodes((nodes: Node[]) => nodes.filter((node: Node) => !nodeIds.includes(node.id)));
      
      // Clean up edges connected to deleted nodes
      setEdges((edges: Edge[]) => edges.filter((edge: Edge) => 
        !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
      ));

      // Close settings panel if deleted node was selected
      if (selectedNode && nodeIds.includes(selectedNode.id)) {
        setSelectedNode(null);
        setShowSettings(false);
      }

      toast.success(`Deleted ${selectedNodes.length} node${selectedNodes.length > 1 ? 's' : ''}`);
    }

    // Handle standalone edge deletion
    if (selectedEdges.length > 0) {
      const edgeIds = selectedEdges.map(edge => edge.id);
      setEdges((edges: Edge[]) => edges.filter(edge => !edgeIds.includes(edge.id)));
      
      toast.success(`Deleted ${selectedEdges.length} connection${selectedEdges.length > 1 ? 's' : ''}`);
    }
  }, [nodes, edges, selectedNode, setNodes, setEdges]);

  // Set up keyboard listener for delete functionality
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown); // Cleanup
    };
  }, [handleKeyDown]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Nodes Panel */}
      <NodesPanel />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar with save button */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            Chatbot Flow Builder
          </h1>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>

        {/* React Flow canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            className="bg-white"
            edgesUpdatable={true} // Allow edge editing
            edgesFocusable={true} // Allow edge selection
            multiSelectionKeyCode="Control" // Multi-select with Ctrl
          >
            <Controls position="bottom-left" />
            <MiniMap 
              nodeColor="#a7f3d0"
              nodeStrokeWidth={2}
              className="bg-white border border-gray-200 rounded-lg"
              position="bottom-right"
            />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
          </ReactFlow>
        </div>
      </div>

      {/* Right Sidebar - Settings Panel */}
      {showSettings && (
        <SettingsPanel
          selectedNode={selectedNode}
          onNodeDataChange={handleNodeDataChange}
          onClose={handleCloseSettings}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="rounded-lg"
      />
    </div>
  );
}

export default App;
