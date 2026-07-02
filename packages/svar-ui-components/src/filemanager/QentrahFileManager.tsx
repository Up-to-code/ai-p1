import React, { useState } from 'react';
import { QentrahThemeProvider } from '../theme';
import { File, Folder, FolderOpen, Upload, Trash2, Download, Search } from 'lucide-react';

export type FileView = 'grid' | 'list' | 'tree';

export interface FileManagerItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  createdAt: Date;
  modifiedAt: Date;
  parentId?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface QentrahFileManagerProps {
  items: FileManagerItem[];
  view?: FileView;
  currentFolderId?: string;
  onFileUpload?: (file: File) => void;
  onFileDelete?: (itemId: string) => void;
  onFileRename?: (itemId: string, newName: string) => void;
  onFileMove?: (itemId: string, targetFolderId: string) => void;
  onFolderCreate?: (name: string, parentId?: string) => void;
  onItemClick?: (item: FileManagerItem) => void;
  onNavigate?: (folderId?: string) => void;
  className?: string;
  showPreview?: boolean;
}

/**
 * QentrahFileManager - Wrapper for @svar-ui/react-filemanager with Qentrah theming.
 * 
 * This component provides a unified file manager interface for document browsing.
 * Currently uses a placeholder implementation - will be integrated with
 * @svar-ui/react-filemanager in the full implementation.
 */
export function QentrahFileManager({
  items = [],
  view = 'grid',
  currentFolderId,
  onFileUpload,
  onFileDelete,
  onFileRename,
  onFileMove,
  onFolderCreate,
  onItemClick,
  onNavigate,
  className = '',
  showPreview = true,
}: QentrahFileManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const currentFolderItems = items.filter(
    (item) => item.parentId === currentFolderId
  );

  const filteredItems = currentFolderItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = filteredItems.filter((item) => item.type === 'folder');
  const files = filteredItems.filter((item) => item.type === 'file');

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleItemClick = (item: FileManagerItem) => {
    if (item.type === 'folder') {
      onNavigate?.(item.id);
    } else {
      onItemClick?.(item);
    }
  };

  const handleSelectItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  return (
    <QentrahThemeProvider>
      <div className={`w-full h-full bg-background flex flex-col ${className}`}>
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate?.(undefined)}
              className="px-3 py-1.5 bg-muted rounded hover:bg-muted-foreground hover:text-background transition-colors"
            >
              Home
            </button>
            {currentFolderId && (
              <button
                onClick={() => {
                  const currentFolder = items.find((i) => i.id === currentFolderId);
                  onNavigate?.(currentFolder?.parentId);
                }}
                className="px-3 py-1.5 bg-muted rounded hover:bg-muted-foreground hover:text-background transition-colors"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-1.5 border rounded-md bg-background"
              />
            </div>
            <label className="px-3 py-1.5 bg-primary text-primary-foreground rounded cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2">
              <Upload size={16} />
              Upload
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
            <button
              onClick={() => onFolderCreate?.('New Folder', currentFolderId)}
              className="px-3 py-1.5 bg-muted rounded hover:bg-muted-foreground hover:text-background transition-colors flex items-center gap-2"
            >
              <Folder size={16} />
              New Folder
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                    selectedItems.has(folder.id) ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => handleItemClick(folder)}
                  onContextMenu={(e) => handleSelectItem(e, folder.id)}
                >
                  <FolderOpen className="w-12 h-12 text-primary mb-2" />
                  <div className="text-sm font-medium truncate">{folder.name}</div>
                </div>
              ))}
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                    selectedItems.has(file.id) ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => handleItemClick(file)}
                  onContextMenu={(e) => handleSelectItem(e, file.id)}
                >
                  <File className="w-12 h-12 text-muted-foreground mb-2" />
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-muted transition-colors ${
                    selectedItems.has(folder.id) ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => handleItemClick(folder)}
                  onContextMenu={(e) => handleSelectItem(e, folder.id)}
                >
                  <Folder className="w-5 h-5 text-primary" />
                  <span className="flex-1">{folder.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(folder.modifiedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-muted transition-colors ${
                    selectedItems.has(file.id) ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => handleItemClick(file)}
                  onContextMenu={(e) => handleSelectItem(e, file.id)}
                >
                  <File className="w-5 h-5 text-muted-foreground" />
                  <span className="flex-1">{file.name}</span>
                  <span className="text-sm text-muted-foreground w-24">
                    {formatFileSize(file.size)}
                  </span>
                  <span className="text-sm text-muted-foreground w-32">
                    {new Date(file.modifiedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Folder className="w-16 h-16 mb-4 opacity-50" />
              <p>This folder is empty</p>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between p-2 border-t text-sm text-muted-foreground">
          <span>{filteredItems.length} items</span>
          {selectedItems.size > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => selectedItems.forEach((id) => onFileDelete?.(id))}
                className="px-2 py-1 hover:bg-destructive hover:text-destructive-foreground rounded transition-colors flex items-center gap-1"
              >
                <Trash2 size={14} />
                Delete ({selectedItems.size})
              </button>
            </div>
          )}
        </div>
      </div>
    </QentrahThemeProvider>
  );
}
