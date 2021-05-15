import { Command } from 'commander'
const program = new Command()

import { getShoot } from './shoots/api'
import { executePreScript } from './worker'

program
  .version('0.1.0')
  .command('run-pre-script <shootId>', 'Run pre script')
  .action(async (shootId) => {
    const shoot = await getShoot(shootId)
    await executePreScript(shoot)
  })
