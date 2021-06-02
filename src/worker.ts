import { exec } from 'child_process'
import Debug from 'debug'
import faktory from 'faktory-worker'
import { JobFunction } from 'faktory-worker/lib/worker'

import { downloadOrderImages } from './orders'
// import { uploadPackageItem } from './package-items'
import { getShoot, getShootsByPackageId, updateShootFiles } from './shoots/api'
import { Shoot } from './shoots/types'
import {
  createShootDirectories,
  createShootPreScript,
  getOriginalFilesByShoot,
} from './shoots/util'

const debug = Debug('tronhouse-worker:worker')

export const photoshopPath = 'C:/Program Files/Adobe/Adobe Photoshop 2021/Photoshop.exe'

/**
 * Download all order images, update shoot files to the latest state in case files is changed
 * Retun the updated shoot
 * @param shoot
 */
export async function ensurePreScript(shoot: Shoot) {
  const originalFiles = await getOriginalFilesByShoot(shoot.order_id, shoot.id)
  await updateShootFiles(shoot.id, { originalFiles })
  await downloadOrderImages(shoot.order_id)
  return getShoot(shoot.id)
}

export async function executePreScript(shoot: Shoot) {
  const scriptPath = await createShootPreScript(shoot)
  return new Promise((resolve, reject) => {
    exec(`"${photoshopPath}" "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        // TODO: Save error into shoot
        reject(error.message)
        return
      }
      if (stderr) {
        reject(stderr)
        return
      }
      resolve(true)
    })
  })
}

export const handleShootTransited = async (payload: Shoot) => {
  try {
    debug('shoot_transited', payload.id)
    const shoot = await getShoot(payload.id)
    switch (payload.state) {
      case 'shot':
        await ensurePreScript(shoot)
        await executePreScript(shoot)
        // await uploadPackageItem(shoot.package_item_id)
        break
      case 'retouched':
        debug('Run post-action', shoot.id)
        return 1
    }
  } catch (err) {
    debug(err)
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
  })

  worker.register('package_created', handlePackageCreated as JobFunction)
  worker.register('shoot_transited', handleShootTransited as JobFunction)
}

run().catch(console.log)
