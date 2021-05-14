import AdmZip from 'adm-zip'
import fs from 'fs'
import makeDir from 'make-dir'
import path from 'path'

import { uploadFile } from './auth'
import { getPackageItem } from './shoots/api'
import { PackageItem } from './shoots/types'
import { getAssetPath } from './shoots/util'

/**
 * Get all the pre.psd of the shoots of the package
 * Zip into 1 zip file with name = package item id
 * Upload to Google Drive
 */

export async function uploadPackageItem(packageItemId: string) {
  const packageItem = await getPackageItem(packageItemId)
  const canContinue = packageItem.shoots.every((s) => s.state === 'shot')
  if (!canContinue) {
    return
  }
  const packageItemFile = await zipPackageItem(packageItem)
  await uploadFile(`package-items/${packageItem.id}.zip`, packageItemFile)
}

export async function zipPackageItem(packageItem: PackageItem) {
  const targetFile = getAssetPath(`/package-items/${packageItem.id}.zip`)
  if (fs.existsSync(targetFile)) {
    throw new Error(`Target file is created`)
  }

  const preActionFiles = packageItem.shoots.map((x) => ({
    shootPath: `${x.id}.psd`,
    actualPath: getAssetPath(`${x.paths['pre_action']}.psd`),
  }))

  // Zip file
  const zip = new AdmZip()
  preActionFiles.forEach((f) => {
    zip.addLocalFile(f.actualPath, '', f.shootPath)
  })
  makeDir.sync(path.dirname(targetFile))
  zip.writeZip(targetFile)
  return targetFile
}

// When the retoucher register task; share the package item with the retoucher
export async function sharePackageItemFile(_packageItemId: string) {
  //
}
