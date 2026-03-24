import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { MindMapData, MindMapNode } from '../../types';
import { generateId } from '../../utils/helpers';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

const NODE_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6',
  '#ec4899', '#f97316', '#14b8a6', '#ef4444', '#84cc16',
];

const NODE_W = 120;
const NODE_H = 40;

export default function MindMap() {
  const { mindMaps, addMindMap, updateMindMap, deleteMindMap } = useStore();
  const [activeMindMapId, setActiveMindMapId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMapTitle, setNewMapTitle] = useState('');

  const activeMindMap = activeMindMapId ? mindMaps.find((m) => m.id === activeMindMapId) : null;

  function handleCreate() {
    if (!newMapTitle.trim()) return;
    const rootId = generateId();
    const newMap: MindMapData = {
      id: generateId(),
      title: newMapTitle.trim(),
      nodes: [
        {
          id: rootId,
          label: newMapTitle.trim(),
          parentId: null,
          x: 400,
          y: 300,
          color: '#6366f1',
        },
      ],
    };
    addMindMap(newMap);
    setNewMapTitle('');
    setShowCreateForm(false);
    setActiveMindMapId(newMap.id);
  }

  if (activeMindMap) {
    return (
      <MindMapEditor
        mindMap={activeMindMap}
        onUpdate={(updates) => updateMindMap(activeMindMap.id, updates)}
        onBack={() => setActiveMindMapId(null)}
      />
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="section-title">🧠 Mind Map — 마인드맵</h2>
          <p className="section-subtitle">Visualize ideas with interactive mind maps.</p>
        </div>
        <button className="btn-primary flex items-center gap-1" onClick={() => setShowCreateForm(true)}>
          <Plus size={14} /> New Mind Map
        </button>
      </div>

      {showCreateForm && (
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-3">New Mind Map</h3>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Mind map title / central topic..."
              value={newMapTitle}
              onChange={(e) => setNewMapTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <button className="btn-primary" onClick={handleCreate}>Create</button>
            <button className="btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {mindMaps.length === 0 && !showCreateForm && (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">🧠</div>
          <p className="text-slate-600 font-medium">No mind maps yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first mind map to organize ideas visually</p>
          <button className="btn-primary mt-4" onClick={() => setShowCreateForm(true)}>
            Create First Mind Map
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mindMaps.map((map) => (
          <div
            key={map.id}
            className="card hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveMindMapId(map.id)}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl mb-2">🧠</div>
                <h3 className="font-bold text-slate-800">{map.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{map.nodes.length} nodes</p>
              </div>
              <button
                className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMindMap(map.id);
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
            <button className="mt-3 btn-secondary text-xs w-full">Open Editor →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MindMapEditor({
  mindMap,
  onUpdate,
  onBack,
}: {
  mindMap: MindMapData;
  onUpdate: (updates: Partial<MindMapData>) => void;
  onBack: () => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<{ nodeId: string; offsetX: number; offsetY: number } | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [svgSize, setSvgSize] = useState({ w: 900, h: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        setSvgSize({
          w: containerRef.current.offsetWidth,
          h: containerRef.current.offsetHeight,
        });
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  function updateNodes(nodes: MindMapNode[]) {
    onUpdate({ nodes });
  }

  function handleMouseDown(e: React.MouseEvent, nodeId: string) {
    e.stopPropagation();
    const node = mindMap.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const rect = svgRef.current!.getBoundingClientRect();
    setDragging({
      nodeId,
      offsetX: e.clientX - rect.left - node.x,
      offsetY: e.clientY - rect.top - node.y,
    });
    setSelectedNodeId(nodeId);
    setContextMenu(null);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left - dragging.offsetX;
    const y = e.clientY - rect.top - dragging.offsetY;
    updateNodes(
      mindMap.nodes.map((n) =>
        n.id === dragging.nodeId ? { ...n, x: Math.max(60, x), y: Math.max(20, y) } : n
      )
    );
  }

  function handleMouseUp() {
    setDragging(null);
  }

  function handleDoubleClick(e: React.MouseEvent, nodeId: string) {
    e.stopPropagation();
    // Add child node
    const parent = mindMap.nodes.find((n) => n.id === nodeId);
    if (!parent) return;
    const childIdx = mindMap.nodes.filter((n) => n.parentId === nodeId).length;
    const angle = (childIdx * 45 + 30) * (Math.PI / 180);
    const radius = 160;
    const newNode: MindMapNode = {
      id: generateId(),
      label: 'New Node',
      parentId: nodeId,
      x: parent.x + Math.cos(angle) * radius,
      y: parent.y + Math.sin(angle) * radius,
      color: NODE_COLORS[(mindMap.nodes.length) % NODE_COLORS.length],
    };
    const newNodes = [...mindMap.nodes, newNode];
    updateNodes(newNodes);
    // Start editing the new node
    setEditingNodeId(newNode.id);
    setEditingLabel('New Node');
  }

  function handleContextMenu(e: React.MouseEvent, nodeId: string) {
    e.preventDefault();
    e.stopPropagation();
    const rect = svgRef.current!.getBoundingClientRect();
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      nodeId,
    });
  }

  function deleteNode(nodeId: string) {
    // Delete node and all descendants
    const toDelete = new Set<string>();
    function collectDescendants(id: string) {
      toDelete.add(id);
      mindMap.nodes.filter((n) => n.parentId === id).forEach((n) => collectDescendants(n.id));
    }
    collectDescendants(nodeId);
    updateNodes(mindMap.nodes.filter((n) => !toDelete.has(n.id)));
    setContextMenu(null);
    if (selectedNodeId && toDelete.has(selectedNodeId)) setSelectedNodeId(null);
  }

  function startEditLabel(nodeId: string) {
    const node = mindMap.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setEditingNodeId(nodeId);
    setEditingLabel(node.label);
    setContextMenu(null);
  }

  function saveLabel() {
    if (!editingNodeId) return;
    updateNodes(
      mindMap.nodes.map((n) =>
        n.id === editingNodeId ? { ...n, label: editingLabel.trim() || n.label } : n
      )
    );
    setEditingNodeId(null);
  }

  function changeNodeColor(nodeId: string, color: string) {
    updateNodes(mindMap.nodes.map((n) => (n.id === nodeId ? { ...n, color } : n)));
    setContextMenu(null);
  }

  const rootNode = mindMap.nodes.find((n) => n.parentId === null);

  return (
    <div className="flex flex-col space-y-3 fade-in" style={{ height: 'calc(100vh - 180px)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-1" onClick={onBack}>
            <ArrowLeft size={14} /> Back
          </button>
          <h2 className="text-lg font-bold text-slate-900">{mindMap.title}</h2>
          <span className="text-sm text-slate-400">{mindMap.nodes.length} nodes</span>
        </div>
        <div className="text-xs text-slate-400">
          Double-click node to add child · Right-click to delete/rename · Drag to move
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden relative"
        onClick={() => { setSelectedNodeId(null); setContextMenu(null); }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="mind-map-canvas"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Edges */}
          {mindMap.nodes.map((node) => {
            if (!node.parentId) return null;
            const parent = mindMap.nodes.find((n) => n.id === node.parentId);
            if (!parent) return null;
            return (
              <line
                key={`edge-${node.id}`}
                x1={parent.x}
                y1={parent.y}
                x2={node.x}
                y2={node.y}
                stroke="#cbd5e1"
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}

          {/* Nodes */}
          {mindMap.nodes.map((node) => {
            const isRoot = !node.parentId;
            const w = isRoot ? 140 : NODE_W;
            const h = isRoot ? 48 : NODE_H;
            const isSelected = selectedNodeId === node.id;
            const isEditing = editingNodeId === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x - w / 2}, ${node.y - h / 2})`}
                className="mind-map-node"
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                onDoubleClick={(e) => handleDoubleClick(e, node.id)}
                onContextMenu={(e) => handleContextMenu(e, node.id)}
              >
                <rect
                  width={w}
                  height={h}
                  rx={isRoot ? 12 : 8}
                  fill={node.color}
                  stroke={isSelected ? '#1e293b' : 'transparent'}
                  strokeWidth={2}
                  opacity={0.9}
                />
                {isEditing ? (
                  <foreignObject x={4} y={h / 2 - 12} width={w - 8} height={24}>
                    <input
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'white',
                        fontSize: isRoot ? '13px' : '11px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      onBlur={saveLabel}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveLabel();
                        if (e.key === 'Escape') setEditingNodeId(null);
                      }}
                      autoFocus
                    />
                  </foreignObject>
                ) : (
                  <text
                    x={w / 2}
                    y={h / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize={isRoot ? 13 : 11}
                    fontWeight="bold"
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    {node.label.length > 14 ? node.label.slice(0, 13) + '…' : node.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="absolute bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 min-w-36"
            style={{ left: contextMenu.x + 8, top: contextMenu.y + 8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => startEditLabel(contextMenu.nodeId)}
            >
              ✏️ Rename
            </button>
            <div className="px-4 py-2">
              <div className="text-xs text-slate-400 mb-1.5">Color</div>
              <div className="flex gap-1.5 flex-wrap">
                {NODE_COLORS.map((color) => (
                  <button
                    key={color}
                    className="w-5 h-5 rounded-full border border-white"
                    style={{ background: color }}
                    onClick={() => changeNodeColor(contextMenu.nodeId, color)}
                  />
                ))}
              </div>
            </div>
            {contextMenu.nodeId !== rootNode?.id && (
              <>
                <hr className="my-1 border-slate-100" />
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  onClick={() => deleteNode(contextMenu.nodeId)}
                >
                  🗑️ Delete node
                </button>
              </>
            )}
            <button
              className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:bg-slate-50"
              onClick={() => setContextMenu(null)}
            >
              Close
            </button>
          </div>
        )}

        {/* Hint */}
        {mindMap.nodes.length <= 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-full">
            Double-click the central node to add child nodes
          </div>
        )}
      </div>
    </div>
  );
}
