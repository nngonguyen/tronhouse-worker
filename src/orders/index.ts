import download from 'download'
import fs from 'fs'
import got from 'got'
import pMap from 'p-map'
import path from 'path'

import { getAssetsDir } from '../config'
import { endpoint } from '../shoots/api'

const assetsPath = getAssetsDir()

async function downloadOrderImage(orderId: string, id: string) {
  const url = `https://assets.tronhouse.vn/44c369cc-1bfa-4f7b-87bd-8d93a48fdb32/origin/${id}`
  const destPath = path.resolve(assetsPath, 'customer-upload', orderId, id)
  if (fs.existsSync(destPath)) {
    return
  }
  return download(url, `.data/${orderId}`)
}

/**
 * Download all order images & save to assets/customer-uploads/[customer-id]/[order-id]
 * This will be fired when a package is created
 */
export async function downloadOrderImages(orderId: string) {
  const url = `${endpoint}/orders/${orderId}/images`
  const data = await got(url).json<string[]>()
  const images = data
  console.log(images)
  return pMap(images, (id) => {
    return downloadOrderImage(orderId, id)
  })
}
