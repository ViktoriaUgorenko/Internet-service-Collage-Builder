interface ToolbarProps {
  onAddText: () => void;
  onAddImage: () => void;
  onDelete: () => void;
  disabled: boolean;
  gridEnabled: boolean;
  snapEnabled: boolean;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onPreview?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  onAddImageSearch?: () => void;
  onShowTemplates?: () => void;
  onExport?: () => void;
}
interface ToolBtnProps {
  onClick: () => void; title: string; disabled?: boolean; active?: boolean; className?: string; children: React.ReactNode;
}
const ToolBtn = ({ onClick, title, disabled, active, className = '', children }: ToolBtnProps) => (
  <button onClick={onClick} disabled={disabled} title={title}
    className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${active ? 'bg-blue-500 text-white' : className}`}>
    {children}
  </button>
);
export function Toolbar({ onAddText, onAddImage, onDelete, disabled, gridEnabled, snapEnabled, onToggleGrid, onToggleSnap }: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-white border-b shadow-sm flex-wrap flex-shrink-0">
      <span className="text-xs text-gray-400 mr-1 uppercase tracking-wide">Add:</span>
      <ToolBtn onClick={onAddText} title="Text" disabled={disabled} className="bg-gray-100 hover:bg-gray-200 text-gray-700">Text</ToolBtn>
      <ToolBtn onClick={onAddImage} title="Image" disabled={disabled} className="bg-gray-100 hover:bg-gray-200 text-gray-700">Image</ToolBtn>
      <div className="w-px h-5 bg-gray-200 mx-0.5" />
      <ToolBtn onClick={onDelete} title="Delete" disabled={disabled} className="bg-red-50 hover:bg-red-100 text-red-600">Delete</ToolBtn>
      <div className="w-px h-5 bg-gray-200 mx-0.5" />
      <ToolBtn onClick={onToggleGrid} title="Grid" active={gridEnabled} className="bg-gray-100 hover:bg-gray-200 text-gray-700">Grid</ToolBtn>
      <ToolBtn onClick={onToggleSnap} title="Snap" active={snapEnabled} className="bg-gray-100 hover:bg-gray-200 text-gray-700">Snap</ToolBtn>
    </div>
  );
}
