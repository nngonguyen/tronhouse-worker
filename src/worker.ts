import Debug from 'debug'
import faktory from 'faktory-worker'
import { JobFunction } from 'faktory-worker/lib/worker'

import { getShoot } from './shoots/api'
import { createShootDirectories } from './shoots/util'

export interface Args {
  id: string
  state: 'retouched' | 'shooted'
}

const debug = Debug('tronhouse-worker:worker')

export const handleShootCreated: JobFunction = async (args) => {
  const payload = args as Args
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
  const payload = args as Args
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

async function run() {
  const worker = await faktory.work({
    host: '192.53.114.99',
    password: 'a432cb46d5058a7b',
    queues: ['default', 'nodejs'],
  })

  worker.register('shoot_created', handleShootCreated)
  worker.register('shoot_transited', handleShootTransited)
}

run().catch(console.log)
