export interface Shoot {
  id: string
  package_item_id: string
  paths: Record<string, string>
  order_id: string
  package_id: string
  original_files?: Record<string, string[]>
  state?: 'retouched' | 'shot'
}

export interface PackageItem {
  id: string
  shoots: {
    id: string
    paths: Record<string, string>
    state?: string
  }[]
}
