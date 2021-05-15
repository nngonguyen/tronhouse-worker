import { Command } from 'commander'
const program = new Command()

import { getShoot } from './shoots/api'
import { executePreScript } from './worker'

program
  .version('0.1.0')
  .command('run-pre-script <shootId>')
  .action(async (shootId) => {
    console.log({ shootId })
    console.log(`Start shoot ${shootId} data`)
    const shoot = await getShoot(shootId)
    console.log(`Got shoot data, start run pre-script`)
    try {
      await executePreScript(shoot)
      console.log(`Run prescript successfully!`)
      process.exit(0)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })

program.parse(process.argv)
