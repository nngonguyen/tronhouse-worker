import { exec } from 'child_process'
import Debug from 'debug'
import faktory from 'faktory-worker'
import { JobFunction } from 'faktory-worker/lib/worker'
import fs from 'fs'
import path from 'path'

import { getAssetsDir } from './config'
import { downloadOrderImages } from './orders'
// import { uploadPackageItem } from './package-items'
import { getShoot, getShootsByPackageId, updateShootFiles } from './shoots/api'
import { Shoot } from './shoots/types'
import {
  createShootDirectories,
  createShootPostScript,
  createShootPreScript,
  getOriginalFilesByShoot,
} from './shoots/util'

const debug = Debug('tronhouse-worker:worker')

export const photoshopPath = 'C:/Program Files/Adobe/Adobe Photoshop 2024/Photoshop.exe'

/**
 * Download all order images, update shoot files to the latest state in case files is changed
 * Retun the updated shoot
 * @param shoot
 */
export async function ensurePreScript(shoot: Shoot) {
  const originalFiles = await getOriginalFilesByShoot(shoot.order_id, shoot.id)
  await updateShootFiles(shoot.id, { originalFiles })
  if (!fs.existsSync) {
    await downloadOrderImages(shoot.order_id)
  }
  return getShoot(shoot.id)
}

const assetsDir = getAssetsDir()

async function execWithLock(cmd: string, lockFilePath: string, timeout = 120 * 1000) {
  let timer = timeout
  fs.writeFileSync(lockFilePath, '')
  return new Promise((resolve, reject) => {
    exec(cmd, () => {
      const interval = setInterval(() => {
        if (timer < 0) {
          clearInterval(interval)
          // Remove the lockFile if timeout
          fs.unlinkSync(lockFilePath)
          reject('Exec timeout')
        }
        const isRemoved = !fs.existsSync(lockFilePath)
        if (isRemoved) {
          clearInterval(interval)
          resolve(true)
        } else {
          timer -= 1000
        }
      }, 1000)
    })
  })
}

export async function executePreScript(shoot: Shoot) {
  const scriptPath = await createShootPreScript(shoot)
  const lockFilePath = path.join(assetsDir, 'locks', `${shoot.id}.pre`)
  const cmd = `"${photoshopPath}" "${scriptPath}"`
  return execWithLock(cmd, lockFilePath)
}

export async function executePostScript(shoot: Shoot) {
  const scriptPath = await createShootPostScript(shoot)
  const lockFilePath = path.join(assetsDir, 'locks', `${shoot.id}.post`)
  const cmd = `"${photoshopPath}" "${scriptPath}"`
  return execWithLock(cmd, lockFilePath)
}

export const handleShootTransited = async (payload: Shoot) => {
  try {
    console.log('handle shoot_transited', payload.id, payload.state)
    const shoot = await getShoot(payload.id)
    switch (payload.state) {
      case 'shot':
        await ensurePreScript(shoot)
        await executePreScript(shoot)
        // await uploadPackageItem(shoot.package_item_id)
        break
      case 'retouched':

        await executePostScript(shoot)
        // console.log('Run post-action', shoot.id)
        // return 1
    }
  } catch (err) {
    console.error(err)
  }
}

export const handlePackageCreated = async ({ id }: { id: string }) => {
  const shoots = await getShootsByPackageId(id)
  const files = await Promise.all(shoots.map(createShootDirectories))

  debug(`Generate ${files.length} files`)
  return files
}

async function run() {
  const worker = await faktory.work({
    host: '192.53.114.99',
    password: 'a432cb46d5058a7b',
    queues: ['default', 'nodejs'],
    concurrency: 1,
    poolSize: 1,
  })

  worker.register('package_created', handlePackageCreated as JobFunction)
  worker.register('shoot_transited', handleShootTransited as JobFunction)
}

run().catch(console.log)
