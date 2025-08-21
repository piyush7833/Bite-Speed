import { Node, Edge } from 'reactflow';

// TypeScript interface for validation function return values
export interface ValidationResult {
  isValid: boolean;      // Whether the flow passes validation
  errorMessage?: string; // Error description if validation fails
}

/**
 * Flow Validation Utility - Business Logic for Chatbot Flows
 * 
 * Purpose:
 * This module contains the core business logic for validating chatbot flows
 * before they can be saved. It ensures flows follow proper chatbot conversation
 * patterns and prevent invalid flow structures.
 * 
 * Business Rules for Chatbot Flows:
 * 1. Empty flows (0 nodes) are always valid
 * 2. Single-node flows are always valid (simple responses)
 * 3. Multi-node flows must have exactly ONE starting point (entry node)
 * 4. Starting points are nodes with no incoming connections
 * 5. Multiple starting points create ambiguous conversation flows
 * 
 * Real-world Application:
 * - Starting node: "Welcome! How can I help you?"
 * - Middle nodes: "Thanks for your question..."
 * - End nodes: "Have a great day!"
 * 
 * Invalid Pattern: Multiple nodes with no incoming connections
 * This would mean multiple conversation starting points, which is confusing
 * for users and unclear for chatbot logic.
 */

/**
 * Validates a chatbot flow before saving
 * 
 * Validation Logic:
 * 1. Check if flow is empty or single-node (always valid)
 * 2. For multi-node flows, identify nodes without incoming connections
 * 3. Ensure maximum one "starting point" node exists
 * 4. Return appropriate validation result with error message
 * 
 * Algorithm Details:
 * - Uses Array.filter to find nodes without incoming edges
 * - Uses Array.some to check if any edge targets each node
 * - Compares count against business rule (max 1 starting node)
 * 
 * @param nodes - Array of React Flow nodes in the current flow
 * @param edges - Array of React Flow edges (connections) in the current flow
 * @returns ValidationResult object with isValid flag and optional error message
 */
export const validateFlow = (nodes: Node[], edges: Edge[]): ValidationResult => {
  // Early return for simple flows
  // Single-node or empty flows don't need validation
  if (nodes.length <= 1) {
    return { isValid: true };
  }

  // Find all nodes that have no incoming connections
  // These are potential "starting points" for the conversation flow
  const nodesWithoutIncomingEdges = nodes.filter(node => {
    // Check if ANY edge has this node as its target
    return !edges.some(edge => edge.target === node.id);
  });

  // Business Rule Validation: Maximum one starting point allowed
  // Multiple starting points create ambiguous conversation flows
  if (nodesWithoutIncomingEdges.length > 1) {
    return {
      isValid: false,
      errorMessage: `Cannot save Flow` // Matches UI design requirement
    };
  }

  // If we reach here, the flow is valid
  return { isValid: true };
};

/**
 * Creates a clean, serializable flow data structure for saving
 * 
 * Purpose:
 * - Converts React Flow's internal data structures to clean JSON
 * - Removes React-specific properties and UI state
 * - Creates a portable format for saving, exporting, or API calls
 * - Maintains only essential flow information
 * 
 * Data Transformation:
 * - Extracts core node properties: id, type, position, data
 * - Extracts core edge properties: id, source, target, handles
 * - Removes internal React Flow properties (selected, dragging, etc.)
 * - Results in clean JSON suitable for storage or transmission
 * 
 * Use Cases:
 * 1. Saving flows to local storage
 * 2. Exporting flows for backup
 * 3. Sending flows to backend APIs
 * 4. Logging flows for debugging
 * 
 * @param nodes - Array of React Flow nodes to serialize
 * @param edges - Array of React Flow edges to serialize
 * @returns Clean object containing essential flow data only
 */
export const createFlowData = (nodes: Node[], edges: Edge[]) => {
  return {
    // Transform nodes to include only essential properties
    nodes: nodes.map(node => ({
      id: node.id,           // Unique identifier
      type: node.type,       // Node type (textNode, etc.)
      position: node.position, // X,Y coordinates on canvas
      data: node.data        // Custom data (text content, etc.)
    })),
    
    // Transform edges to include only connection information
    edges: edges.map(edge => ({
      id: edge.id,                   // Unique edge identifier
      source: edge.source,           // Source node ID
      target: edge.target,           // Target node ID
      sourceHandle: edge.sourceHandle, // Source handle identifier (if any)
      targetHandle: edge.targetHandle  // Target handle identifier (if any)
    }))
  };
};
