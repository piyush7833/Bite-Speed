import { Node, Edge } from 'reactflow';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Flow validation utilities for chatbot flows
 * 
 * Business Rules:
 * - Single starting node (no incoming connections) required for clear entry point
 * - All nodes must be connected (no isolated islands)
 * - Target handles can accept multiple connections, source handles limited to one
 * 
 * Used before saving to ensure valid chatbot conversation structure
 */

// Main validation function - checks flow structure before saving
// Returns error messages explaining why validation failed
export const validateFlow = (nodes: Node[], edges: Edge[]): ValidationResult => {
  // Empty or single-node flows are always valid
  if (nodes.length <= 1) {
    return { isValid: true };
  }

  // Build set of all nodes that have connections
  const connectedNodeIds = new Set<string>();
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source); // Track connected nodes
    connectedNodeIds.add(edge.target);
  });
  
  // Find completely isolated nodes (no connections at all)
  const disconnectedNodes = nodes.filter(node => !connectedNodeIds.has(node.id));
  
  if (disconnectedNodes.length > 1) { // Multiple islands not allowed
    return {
      isValid: false,
      errorMessage: `Cannot save Flow: ${disconnectedNodes.length} nodes are completely disconnected. Please connect all nodes to create a valid conversation flow.`
    };
  }

  // If there's exactly one disconnected node and other connected nodes, it might be valid
  // but we need to check the main flow structure
  if (disconnectedNodes.length === 1 && connectedNodeIds.size > 0) {
    return {
      isValid: false,
      errorMessage: `Cannot save Flow: 1 node is disconnected from the main flow. Please connect all nodes to create a valid conversation path.`
    };
  }

  const nodesWithoutIncomingEdges = nodes.filter(node => {
    return !edges.some(edge => edge.target === node.id); // Find potential starting nodes
  });

  if (nodesWithoutIncomingEdges.length > 1) {
    return {
      isValid: false,
      errorMessage: `Cannot save Flow: ${nodesWithoutIncomingEdges.length} nodes have no incoming connections. Only one starting node is allowed in a chatbot flow.`
    };
  }

  if (nodes.length > 1 && nodesWithoutIncomingEdges.length === 0) {
    return {
      isValid: false,
      errorMessage: `Cannot save Flow: No starting node found. At least one node must have no incoming connections to serve as the conversation entry point.`
    };
  }

  return { isValid: true };
};

// Create clean flow data for saving/export
// Strips out React Flow internal properties, keeping only essential data
export const createFlowData = (nodes: Node[], edges: Edge[]) => {
  return {
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data // Just the essential properties
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle
    }))
  };
};
