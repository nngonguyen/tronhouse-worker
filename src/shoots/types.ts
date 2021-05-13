export interface Shoot {
  id: string
  paths: Record<string, string>
  original_files?: Record<string, string[]>
  state?: 'retouched' | 'shooted'
}
