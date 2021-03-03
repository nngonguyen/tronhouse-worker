import Debug from 'debug'
import faktory from 'faktory-worker'
import { JobFunction } from 'faktory-worker/lib/worker'

import { getShoot, getShootsByPackageId } from './shoots/api'
import { Shoot } from './shoots/types'
import { createShootDirectories } from './shoots/util'
import { watchOriginalFiles } from './shoots/watcher'

const debug = Debug('tronhouse-worker:worker')

export const handleShootCreated = async (payload: Shoot) => {
  try {
    debug('shoot_created', payload)
    const shoot = await getShoot(payload.id)
    const tmp = await createShootDirectories(shoot)
    debug(tmp)
  } catch (err) {
    debug(err)
  }
}

export const handleShootTransited = async (payload: Shoot) => {
  try {
    debug('shoot_transited', payload.id)
    const shoot = await getShoot(payload.id)
    switch (payload.state) {
      case 'shooted':
        debug('Run pre-action', shoot.id)
        return 1
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
  })

  worker.register('shoot_created', handleShootCreated as JobFunction)
  worker.register('shoot_transited', handleShootTransited as JobFunction)
  worker.register('package_created', handlePackageCreated as JobFunction)

  watchOriginalFiles()
}

run().catch(console.log)
