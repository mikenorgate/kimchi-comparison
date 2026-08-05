export type NodeKind = 'folder' | 'file' | 'app' | 'link'

export interface FileSystemNode {
  id: string
  name: string
  kind: NodeKind
  icon?: string
  children?: FileSystemNode[]
  size?: string
  modified?: string
}

export type ViewMode = 'icon' | 'list'
