import { config } from 'dotenv'
import path from 'path'

config()

export const getAppEndpoint = () => {
  const endpoint = process.env.TRONHOUSE_APP_ENDPOINT || 'https://app-api.tronhouse.vn'
  if (!endpoint) {
    throw new Error('Please provide TRONHOUSE_APP_ENDPOINT env')
  }
  return endpoint
}

export const getAssetsDir = () => {
  if (process.env.NODE_ENV === 'test') {
    return path.resolve('src/tests/fixtures').replace(/\\/g, '/')
  }
  const assetsDir = process.env.TRONHOUSE_ASSETS_DIR
  if (!assetsDir) {
    throw new Error('Please provide TRONHOUSE_ASSETS_DIR env')
  }
  return assetsDir
}

export const getScriptsDir = () => {
  const assetsDir = getAssetsDir()
  return path.join(assetsDir, 'scripts')
}

export const getOriginalFilesPattern = () => {
  const pattern = process.env.TRONHOUSE_ORIGINAL_FILES_PATTERN
  if (!pattern) {
    throw new Error('Please provide TRONHOUSE_ORIGINAL_FILES_PATTERN env')
  }
  return pattern
}
