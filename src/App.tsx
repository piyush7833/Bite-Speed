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
  OnNodesChange,
  OnEdgesChange,
  OnSelectionChange,
} from 'reactflow';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import TextNode, { TextNodeData } from './nodes/TextNode';
import NodesPanel from './components/NodesPanel';
import SettingsPanel from './components/SettingsPanel';
import { validateFlow, createFlowData } from './utils/validation';

// Define custom node types for React Flow
// This maps string identifiers to actual React components
const nodeTypes: NodeTypes = {
  textNode: TextNode, // Maps 'textNode' string to our custom TextNode component
};

// Initial empty state - no nodes or connections when app starts
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

/**
 * Main App component - Chatbot Flow Builder
 * 
 * Architecture Overview:
 * - Uses React Flow as the core canvas for node-based editing
 * - Three-panel layout: NodesPanel (left), Canvas (center), SettingsPanel (right)
 * - State management using React Flow hooks for nodes and edges
 * - Implements drag-and-drop from nodes panel to canvas
 * - Enforces business rules for connections (one outgoing per node)
 * - Provides save functionality with flow validation
 * 
 * Key Features:
 * - Drag & drop node creation from left panel
 * - Node selection and editing via right panel
 * - Connection validation (source: 1 outgoing, target: multiple incoming)
 * - Flow validation before save (max 1 starting node)
 * - Toast notifications for user feedback
 */
function App() {
  // React Flow state management hooks
  // useNodesState and useEdgesState provide optimized state management for React Flow
  const [nodes, setNodes, onNodesChange]: [Node[], any, OnNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange]: [Edge[], any, OnEdgesChange] = useEdgesState(initialEdges);
  
  // UI state management
  const [selectedNode, setSelectedNode] = useState<Node<TextNodeData> | null>(null); // Currently selected node for editing
  const [showSettings, setShowSettings] = useState(false); // Controls right panel visibility
  
  // Refs for React Flow integration
  const reactFlowWrapper = useRef<HTMLDivElement>(null); // Reference to the flow wrapper for drag & drop positioning
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null); // React Flow instance for coordinate projection

  /**
   * Handle new connections between nodes
   * 
   * Business Rule Implementation:
   * - Each source handle can only have ONE outgoing connection
   * - Target handles can accept MULTIPLE incoming connections
   * 
   * This enforces a tree-like structure where each node can only lead to one next step,
   * but multiple nodes can lead to the same destination (many-to-one relationships)
   */
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      // Check if the source node already has an outgoing connection
      const existingEdge = edges.find(edge => 
        edge.source === params.source && edge.sourceHandle === params.sourceHandle
      );

      if (existingEdge) {
        toast.error('Each node can only have one outgoing connection');
        return;
      }

      // If validation passes, add the new edge to the flow
      setEdges((eds) => addEdge(params, eds));
    },
    [edges, setEdges],
  );

  /**
   * Handle node selection changes
   * 
   * Controls the right settings panel:
   * - Single node selected: Show settings panel for editing
   * - No nodes or multiple nodes selected: Hide settings panel
   */
  const onSelectionChange: OnSelectionChange = useCallback((params) => {
    if (params.nodes.length === 1) {
      setSelectedNode(params.nodes[0] as Node<TextNodeData>);
      setShowSettings(true);
    } else {
      setSelectedNode(null);
      setShowSettings(false);
    }
  }, []);

  /**
   * Handle dropping nodes from the panel onto the canvas
   * 
   * Drag & Drop Implementation:
   * 1. Get the drop position relative to the React Flow canvas
   * 2. Extract the node type from the drag event data
   * 3. Convert screen coordinates to flow coordinates using React Flow's project method
   * 4. Create a new node with unique ID and position it at the drop location
   * 5. Add the new node to the nodes array
   */
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Get the bounds of the React Flow wrapper to calculate relative position
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds || !reactFlowInstance) return;

      // Get the node type from the drag data (set in NodesPanel)
      const type = event.dataTransfer.getData('application/reactflow');

      // Validate that we have a valid node type
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Convert mouse position to React Flow coordinates
      // This accounts for canvas pan/zoom state
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create new node with unique timestamp-based ID
      const newNode: Node<TextNodeData> = {
        id: `node-${Date.now()}`, // Unique ID using timestamp
        type, // Node type from drag data
        position, // Calculated drop position
        data: { text: 'Enter your message here' }, // Default content
      };

      // Add the new node to the existing nodes array
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  /**
   * Handle drag over event to allow dropping
   * 
   * Required for HTML5 drag & drop API to work properly.
   * Without this, the drop event won't fire.
   */
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move'; // Show move cursor during drag
  }, []);

  /**
   * Update node data when editing in the settings panel
   * 
   * This function is called whenever the user types in the settings panel textarea.
   * It finds the specific node by ID and updates only its data property while
   * preserving all other node properties (position, type, etc.)
   */
  const handleNodeDataChange = useCallback((nodeId: string, data: TextNodeData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data }; // Update only the data property
        }
        return node; // Return unchanged node for all others
      })
    );
  }, [setNodes]);

  /**
   * Close the settings panel and clear node selection
   * 
   * This function:
   * 1. Hides the right settings panel
   * 2. Clears the selected node state
   * 3. Visually deselects all nodes on the canvas
   */
  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
    setSelectedNode(null);
    // Deselect all nodes visually
    setNodes((nds) =>
      nds.map((node) => ({ ...node, selected: false }))
    );
  }, [setNodes]);

  /**
   * Handle save button click with comprehensive validation
   * 
   * Save Process:
   * 1. Validate the flow structure using business rules
   * 2. If invalid: Show error message and abort
   * 3. If valid: Create clean flow data and log to console
   * 4. Show success notification
   * 
   * Business Rules:
   * - Multiple nodes: Maximum one node can have no incoming connections (starting point)
   * - Single node or empty flow: Always valid
   */
  const handleSave = useCallback(() => {
    // Run flow validation using utility function
    const validation = validateFlow(nodes, edges);
    
    if (!validation.isValid) {
      toast.error(validation.errorMessage);
      return;
    }

    // Create clean JSON representation of the flow
    const flowData = createFlowData(nodes, edges);
    console.log('Flow saved successfully:', flowData);
    toast.success('Flow saved successfully! Check console for details.');
  }, [nodes, edges]);

  /**
   * Handle keyboard-based deletion of selected nodes and edges
   * 
   * Deletion Logic:
   * 1. Listen for Delete or Backspace key presses
   * 2. Find all currently selected nodes and edges
   * 3. Remove selected items from their respective arrays
   * 4. Close settings panel if selected node is deleted
   * 5. Prevent deletion when user is typing in text inputs
   * 
   * User Experience:
   * - Works with both Delete and Backspace keys
   * - Provides visual feedback via toast notification
   * - Respects input focus (doesn't delete while typing)
   * - Handles both single and multiple selections
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only handle deletion keys
    if (event.key !== 'Delete' && event.key !== 'Backspace') {
      return;
    }

    // Don't delete if user is typing in an input field
    const activeElement = document.activeElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    )) {
      return;
    }

    // Prevent default browser behavior (like going back in history)
    event.preventDefault();

    // Find selected nodes and edges
    const selectedNodes = nodes.filter(node => node.selected);
    const selectedEdges = edges.filter(edge => edge.selected);

    // Check if we have anything to delete
    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      return;
    }

    // Delete selected nodes
    if (selectedNodes.length > 0) {
      const nodeIds = selectedNodes.map(node => node.id);
      
      // Remove nodes from state
      setNodes(nodes => nodes.filter(node => !nodeIds.includes(node.id)));
      
      // Remove any edges connected to deleted nodes
      setEdges(edges => edges.filter(edge => 
        !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
      ));

      // Close settings panel if selected node was deleted
      if (selectedNode && nodeIds.includes(selectedNode.id)) {
        setSelectedNode(null);
        setShowSettings(false);
      }

      toast.success(`Deleted ${selectedNodes.length} node${selectedNodes.length > 1 ? 's' : ''}`);
    }

    // Delete selected edges
    if (selectedEdges.length > 0) {
      const edgeIds = selectedEdges.map(edge => edge.id);
      setEdges(edges => edges.filter(edge => !edgeIds.includes(edge.id)));
      
      toast.success(`Deleted ${selectedEdges.length} connection${selectedEdges.length > 1 ? 's' : ''}`);
    }
  }, [nodes, edges, selectedNode, setNodes, setEdges]);

  /**
   * Set up keyboard event listener for deletion functionality
   * 
   * Lifecycle Management:
   * - Adds global keydown listener when component mounts
   * - Removes listener when component unmounts
   * - Updates listener when dependencies change
   * 
   * This allows users to delete selected nodes/edges from anywhere in the app
   */
  useEffect(() => {
    // Add global keyboard event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]); // Re-create listener when handleKeyDown changes

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
            // Enable edge selection and interaction
            edgesUpdatable={true}
            edgesFocusable={true}
            // Allow multiple selections with Ctrl/Cmd key
            multiSelectionKeyCode="Control"
          >
            <Controls position="bottom-left" />
            <MiniMap 
              nodeColor="#a7f3d0"
              nodeStrokeWidth={2}
              className="bg-white border border-gray-200 rounded-lg"
              position="bottom-right"
            />
            <Background variant="dots" gap={20} size={1} color="#e5e7eb" />
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
