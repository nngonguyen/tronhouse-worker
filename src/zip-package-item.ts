import { Command } from 'commander'

import { zipPackageItem } from './package-items'
import { getPackageItem } from './shoots/api'
const program = new Command()

program
  .version('0.1.0')
  .command('zip-package-item <shootId>')
  .action(async (packageItemId) => {
    console.log({ packageItemId })
    const packageItem = await getPackageItem(packageItemId)
    console.log(`Got shoot data, start run pre-script`)
    try {
      await zipPackageItem(packageItem)
      console.log(`Run prescript successfully!`)
      process.exit(0)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })

program.parse(process.argv)
