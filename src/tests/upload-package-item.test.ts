import del from 'del'
import fs from 'fs'

import { zipPackageItem } from '../package-items'
import samplePackageItem from './fixtures/package-item.json'

describe('upload package item', () => {
  it('success', async () => {
    const targetFile = await zipPackageItem(samplePackageItem)
    expect(fs.existsSync(targetFile)).toEqual(true)
    await del(targetFile)
  })
})
