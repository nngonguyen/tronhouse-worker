import chokidar from 'chokidar'
import path from 'path'

import { getAssetsDir, getOriginalFilesPattern } from '../config'
import { updateShootFiles } from './api'
import { getOriginalFiles, getShootId } from './util'

const assetsDir = getAssetsDir()
const originalFilesPattern = getOriginalFilesPattern()

export function watchOriginalFiles() {
  const pattern = path.join(assetsDir, originalFilesPattern)
  return chokidar.watch(pattern, { ignoreInitial: true }).on('all', async (event, path) => {
    const filePath = path.replace(assetsDir, '')
    const shootId = getShootId(filePath)
    const originalFiles = await getOriginalFiles(filePath)
    // console.log({ event, shootId, originalFiles, path })
    await updateShootFiles(shootId, { originalFiles })
  })
}
