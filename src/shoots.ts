import glob from 'fast-glob'
import fs from 'fs'
import got from 'got'
import makeDir from 'make-dir'
import path from 'path'
import { promisify } from 'util'

import { getAppEndpoint, getAssetsDir } from './config'

const writeFileAsync = promisify(fs.writeFile)

export interface Shoot {
  id: string
  paths: Record<string, string>
  original_files?: Record<string, string[]>
  pre_script_content: string
  post_script_content: string
}

const endpoint = getAppEndpoint()
const assetsDir = getAssetsDir()
// const originalFilesPattern = getOriginalFilesPattern()

export function getAssetPath(filePath: string) {
  return path.join(assetsDir, filePath)
}

export function getRelativePath(filePath: string) {
  return filePath.replace(assetsDir, '')
}

export async function createShootDirectories(shoot: Shoot) {
  const directories = Object.values(shoot.paths).map((p) => getAssetPath(path.dirname(p)))
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
  const preScriptPath = getAssetPath(shoot.paths['pre_script'])
  await makeDir(path.dirname(preScriptPath))
  await writeFileAsync(preScriptPath, shoot.pre_script_content)
  return preScriptPath
}

export async function createShootPostScript(shoot: Shoot) {
  const postScriptPath = getAssetPath(shoot.paths['post_script'])
  await makeDir(path.dirname(postScriptPath))
  await writeFileAsync(postScriptPath, shoot.post_script_content)
  return postScriptPath
}

export function getShootId(filePath: string) {
  // orders/9HFxlk9v/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0/original
  // Ignore order prefix & order id
  const [, , shootId] = filePath.split(/\//g)
  return shootId
}

/**
 * Given 1 file is created or updated in a specific shoot; get all orginal files of that shoot
 * The changed files is watched by Chokidar
 * @param filePath The file that changed, have the format like: `<assets_dir>/orders/order-id/shoot-id/original/red.psd`
 */
export async function getOriginalFiles(filePath: string) {
  const relativePath = getRelativePath(filePath)
  const [, orderId, shootId] = relativePath.split(/\//g)
  const pattern = path.join(assetsDir, `orders/${orderId}/${shootId}/original/**/*.psd`)
  const prefix = path.join(assetsDir, `orders/${orderId}/${shootId}/original/`)
  const files = await glob(pattern)
  const fileNames = files.map((f) => f.replace(prefix, ''))
  return filesToMap(fileNames)
}

function filesToMap(files: string[]) {
  return files.reduce((acc: Record<string, string[]>, file) => {
    const tmp = file.split(/\//g)
    if (tmp.length === 1) {
      const prev = acc['root'] || []
      return {
        ...acc,
        root: [...prev, tmp[tmp.length - 1]].sort(),
      }
    } else {
      const prefix = tmp.slice(0, tmp.length - 1).join('/')
      const prev = acc[prefix] || []
      return {
        ...acc,
        [prefix]: [...prev, tmp[tmp.length - 1]].sort(),
      }
    }
  }, {})
}

export async function getShoot(shootId: string): Promise<Shoot> {
  const response = await got<Shoot>(`${endpoint}/shoots/${shootId}`, {
    responseType: 'json',
  })
  return response.body
}

export async function updateShootFiles(
  shootId: string,
  { originalFiles }: { originalFiles: Record<string, string[]> },
) {
  const response = await got.put<Shoot>(`${endpoint}/shoots/${shootId}/files`, {
    body: JSON.stringify({
      original_files: originalFiles,
    }),
    responseType: 'json',
  })
  return response.body
}
