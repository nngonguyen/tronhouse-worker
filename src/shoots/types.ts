export interface Shoot {
  id: string
  paths: Record<string, string>
  original_files?: Record<string, string[]>
  pre_script_content: string
  post_script_content: string
  state?: 'retouched' | 'shooted'
}
