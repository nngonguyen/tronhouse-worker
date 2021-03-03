import Debug from 'debug'
import faktory from 'faktory-worker'
import { JobFunction } from 'faktory-worker/lib/worker'

import { getShoot } from './shoots/api'
import { Shoot } from './shoots/types'
import { createShootDirectories } from './shoots/util'

const debug = Debug('tronhouse-worker:worker')

export const handleShootCreated: JobFunction = async (args) => {
  const payload = args as Shoot
  try {
    debug('shoot_created', args)
    const shoot = await getShoot(payload.id)
    const tmp = await createShootDirectories(shoot)
    debug(tmp)
  } catch (err) {
    debug(err)
  }
}

export const handleShootTransited: JobFunction = async (args) => {
  const payload = args as Shoot
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

export const handlePackageCreated: JobFunction = async (args) => {
  const shoots = args as Shoot[]
  await Promise.all(shoots.map(createShootDirectories))
}

async function run() {
  const worker = await faktory.work({
    host: '192.53.114.99',
    password: 'a432cb46d5058a7b',
    queues: ['default', 'nodejs'],
  })

  worker.register('shoot_created', handleShootCreated)
  worker.register('shoot_transited', handleShootTransited)
  worker.register('package_created', handlePackageCreated)
}

run().catch(console.log)
