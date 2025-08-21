# Bite-Speed - Chatbot Flow Builder

A React + TypeScript flow builder application for creating chatbot conversation flows using React Flow. Built for Bite-Speed's frontend assignment.

## 🚀 Live Demo

[Deploy to Vercel](https://vercel.com) - Click to deploy your own instance

## ✨ Features

### Flow Builder
- **React Flow Canvas**: Interactive drag-and-drop flow building interface
- **Message Nodes**: Custom chat message-style nodes with editable content
- **Color-Coded Handles**: Green (outgoing) and Orange (incoming) for clear visual distinction
- **Connection Rules**: Source handles limited to one outgoing edge, target handles accept multiple incoming edges
- **Visual Feedback**: Node selection highlighting and connection validation

### User Interface
- **Nodes Panel**: Left sidebar with draggable message node types
- **Settings Panel**: Right sidebar for editing selected node properties
- **Save Functionality**: Flow validation and export with error handling
- **Deletion Support**: Delete nodes and connections with keyboard shortcuts
- **Multi-Selection**: Select multiple items with Ctrl/Cmd key
- **Modern Design**: Chat-focused UI with clean styling

### Validation & Error Handling
- **Comprehensive Flow Validation**: Multiple validation scenarios with specific error messages
- **Connection Rules**: Prevents invalid connections per node type (one outgoing, multiple incoming)
- **Smart Deletion**: Auto-cleanup of orphaned connections and UI state
- **Descriptive Error Messages**: Clear explanations of validation failures with actionable guidance
- **Toast Notifications**: User-friendly error and success messages

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Flow Editor**: React Flow v11
- **Styling**: TailwindCSS
- **Notifications**: React Toastify
- **Deployment**: Vercel

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/piyush7833/Bite-Speed.git
cd Bite-Speed
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open browser**
Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure & Architecture

```
src/
├── components/                    # Reusable UI components
│   ├── NodesPanel.tsx            # Left sidebar - Node library/palette
│   │                            # • Drag & drop functionality
│   │                            # • Visual node previews
│   │                            # • Extensible for new node types
│   └── SettingsPanel.tsx        # Right sidebar - Node editor
│                                # • Real-time content editing
│                                # • Auto-save functionality
│                                # • Context-aware UI
├── nodes/                       # Custom React Flow node definitions
│   └── TextNode.tsx            # Chat message-style node component
│                               # • Source/target handles
│                               # • Chat UI design
│                               # • Selection states
├── utils/                      # Business logic utilities
│   └── validation.ts          # Flow validation & data transformation
│                               # • Chatbot flow rules
│                               # • Save preparation
│                               # • Error handling
├── App.tsx                     # Main application orchestrator
│                              # • React Flow integration
│                              # • State management
│                              # • Event handling
│                              # • Layout coordination
├── main.tsx                   # Application entry point
│                              # • React 18 root setup
│                              # • Global imports
└── index.css                  # Global styles & framework imports
                               # • React Flow base styles
                               # • Tailwind CSS utilities
                               # • Custom toast styling
```

### 🏗️ Architecture Principles

**Modular Design**: Each component has a single responsibility and clear interfaces

**React Flow Integration**: Leverages React Flow's powerful node-based editing capabilities

**Type Safety**: Full TypeScript implementation for better development experience

**Real-time Updates**: State changes immediately reflect in the UI without manual saves

**Extensible Structure**: Easy to add new node types and validation rules

## 🎯 Usage Guide

### Adding Nodes
1. Drag a "Message" node from the left panel
2. Drop it onto the canvas
3. Click the node to select and edit its content

### Connecting Nodes
1. Click and drag from a node's **green handle** (right side - outgoing)
2. Connect to another node's **orange handle** (left side - incoming)
3. Each green handle can only have one outgoing connection
4. Each orange handle can accept multiple incoming connections

#### Handle Color Guide
- 🟢 **Green Handle** (Right): Outgoing connections - where the flow goes OUT
- 🟠 **Orange Handle** (Left): Incoming connections - where the flow comes IN

### Editing Nodes
1. Select a node by clicking it
2. The settings panel will appear on the right
3. Edit the text content in the textarea
4. Changes are saved automatically

### Deleting Nodes & Connections
1. **Delete Nodes**: Click to select a node, then press `Delete` or `Backspace`
2. **Delete Connections**: Click to select a connection line, then press `Delete` or `Backspace`
3. **Multiple Selection**: Hold `Ctrl` (Windows/Linux) or `Cmd` (Mac) to select multiple items
4. **Smart Deletion**: 
   - Deleting a node automatically removes all its connections
   - Settings panel closes automatically if selected node is deleted
   - Won't delete while typing in text fields
5. **Visual Feedback**: Success notifications show what was deleted

### Saving Flows
1. Click the "Save Changes" button in the top bar
2. Flow will be validated with detailed error messages:
   - **Multiple starting nodes**: "X nodes have no incoming connections. Only one starting node allowed."
   - **Disconnected nodes**: "X nodes are completely disconnected. Please connect all nodes."
   - **Circular flows**: "No starting node found. At least one node must serve as entry point."
   - **Mixed disconnection**: "1 node is disconnected from the main flow."
3. Valid flows are logged to console with success message
4. Invalid flows show specific error notifications explaining what to fix

## 🔧 Customization

### Adding New Node Types

1. **Create node component** in `src/nodes/`:
```typescript
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const CustomNode: React.FC<NodeProps<CustomData>> = ({ data }) => (
  <div className="custom-node">
    <Handle type="target" position={Position.Left} />
    {/* Custom content */}
    <Handle type="source" position={Position.Right} />
  </div>
);
```

2. **Register in App.tsx**:
```typescript
const nodeTypes: NodeTypes = {
  textNode: TextNode,
  customNode: CustomNode, // Add here
};
```

3. **Add to NodesPanel.tsx**:
```typescript
<div draggable onDragStart={(e) => onDragStart(e, 'customNode')}>
  Custom Node
</div>
```

### Extending Validation

Modify `src/utils/validation.ts` to add custom validation rules:

```typescript
export const validateFlow = (nodes: Node[], edges: Edge[]): ValidationResult => {
  // Add your custom validation logic
  return { isValid: true };
};
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Follow prompts** to configure your deployment

### Manual Deployment

1. **Build the project**
```bash
npm run build
```

2. **Deploy** the `dist` folder to your hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Assignment Details

This project was built as a frontend assignment for **Bite-Speed**, implementing a chatbot flow builder with the following key requirements:

### ✅ Completed Features
- ✅ React Flow integration with drag-and-drop functionality
- ✅ Custom message node components with chat-style UI and color-coded handles
- ✅ Left panel for node library/palette
- ✅ Right panel for node editing with real-time updates
- ✅ Connection validation (one outgoing, multiple incoming)
- ✅ Comprehensive flow validation with detailed error messages
- ✅ Node and edge deletion with keyboard shortcuts
- ✅ Multi-selection support
- ✅ Toast notifications for user feedback
- ✅ Clean, extensible code architecture
- ✅ Full TypeScript implementation
- ✅ Comprehensive documentation

### 🎯 Technical Highlights
- **Modern React Patterns**: Hooks, context, and functional components
- **Type Safety**: Full TypeScript coverage with proper interfaces
- **Performance**: Optimized state management with React Flow hooks
- **UX Design**: Intuitive drag-and-drop with color-coded handles and visual feedback
- **Accessibility**: Clear visual distinction between input/output connection points
- **Code Quality**: Extensive comments and modular architecture

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) - Powerful flow building library
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Fast build tool
- **Bite-Speed** - For the interesting frontend challenge