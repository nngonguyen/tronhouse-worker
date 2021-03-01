import fs from 'fs'
import makeDir from 'make-dir'
import path from 'path'
import { promisify } from 'util'

const writeFileAsync = promisify(fs.writeFile)

export interface Shoot {
  id: string
  paths: Record<string, string>
  original_files: Record<string, string[]>
  pre_script_content: string
  post_script_content: string
}

export async function createShootDirectories(shoot: Shoot) {
  const directories = Object.keys(shoot.paths).map((p) => path.dirname(p))
  await Promise.all(directories.map((d) => makeDir(d)))
  return directories
}

export async function createShootScripts(shoot: Shoot) {
  const preScriptPath = shoot.paths['pre_script']
  const postScriptPath = shoot.paths['post_script']
  await writeFileAsync(preScriptPath, shoot.pre_script_content)
  await writeFileAsync(postScriptPath, shoot.post_script_content)
}

export async function createShootPreScript(shoot: Shoot) {
  const preScriptPath = shoot.paths['pre_script']
  await writeFileAsync(preScriptPath, shoot.pre_script_content)
  return preScriptPath
}

export async function createShootPostScript(shoot: Shoot) {
  const postScriptPath = shoot.paths['post_script']
  await writeFileAsync(postScriptPath, shoot.post_script_content)
  return postScriptPath
}

export async function getShoot(shootId: string): Promise<Shoot> {
  return undefined as any
}

export function updateShootFiles(
  shootId: string,
  { originalFiles }: { originalFiles: Record<string, string[]> },
) {
  return 1
}
