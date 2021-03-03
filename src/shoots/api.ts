import got from 'got'

import { getAppEndpoint } from '../config'
import { Shoot } from './types'

export const endpoint = getAppEndpoint()

export async function getShoot(shootId: string): Promise<Shoot> {
  const response = await got<Shoot>(`${endpoint}/shoots/${shootId}`, {
    responseType: 'json',
  })
  return response.body
}

export async function getShootsByPackageId(packageId: string): Promise<Shoot[]> {
  const response = await got<Shoot[]>(`${endpoint}/packages/${packageId}`, {
    responseType: 'json',
  })
  return response.body
}

export async function updateShootFiles(
  shootId: string,
  { originalFiles }: { originalFiles: Record<string, string[]> },
) {
  const response = await got.put<Shoot>(`${endpoint}/shoots/${shootId}/files`, {
    json: {
      original_files: originalFiles,
    },
    responseType: 'json',
  })
  return response.body
}
