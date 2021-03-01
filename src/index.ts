import chokidar from 'chokidar'

import { createShootPostScript, createShootPreScript, getShoot } from './shoots'

// TODO: Get root from api
const root = '/Users/achilles/Workspaces/resources'

// Watch for original files
chokidar.watch(`${root}/*/original/*`, { ignoreInitial: true }).on('all', (event, path) => {
  console.log(event, path)
  const shootId = checkShootStatusByOriginalFile(path)
  console.log('original file uploaded', { shootId })
})

// Watch for retouched files
chokidar.watch(`${root}/*/retouched.*`, { ignoreInitial: true }).on('all', (event, path) => {
  console.log(event, path)
  const shootId = checkShootStatusByRetouchedFile(path)
  console.log('retouched file uploaded', { shootId })
})

function checkShootStatusByOriginalFile(filePath: string) {
  const [, , shootId] = filePath.split(/\//g).reverse()
  return shootId
}

function checkShootStatusByRetouchedFile(filePath: string) {
  const [, shootId] = filePath.split(/\//g).reverse()
  return shootId
}

export async function runScript(scriptPath: string) {
  console.log(scriptPath)
}

export async function runPreAction(shootId: string) {
  const shoot = await getShoot(shootId)
  const scriptPath = await createShootPreScript(shoot)
  await runScript(scriptPath)
  // TODO: Tell the app that prescript is run successfully
}

export async function runPostAction(shootId: string) {
  const shoot = await getShoot(shootId)
  const scriptPath = await createShootPostScript(shoot)
  await runScript(scriptPath)
  // TODO: Generate photos & put to cloud via sftp
}
