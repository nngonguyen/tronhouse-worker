import { exec } from 'child_process'
import Debug from 'debug'
import faktory from 'faktory-worker'
import { JobFunction } from 'faktory-worker/lib/worker'

import { uploadPackageItem } from './package-items'
import { getShoot, getShootsByPackageId } from './shoots/api'
import { Shoot } from './shoots/types'
import { createShootDirectories, createShootPreScript } from './shoots/util'
import { watchOriginalFiles } from './shoots/watcher'

const debug = Debug('tronhouse-worker:worker')

export const photoshopPath = 'C:/Program Files/Adobe/Adobe Photoshop 2021/Photoshop.exe'

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
        await executePreScript(shoot)
        await uploadPackageItem(shoot.package_item_id)
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

  watchOriginalFiles()
}

run().catch(console.log)
