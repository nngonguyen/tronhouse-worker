import nock from 'nock'

import { getAppEndpoint } from '../../config'
import { getShoot, updateShootFiles } from '../api'
import { shoot } from './fixtures'

const appEndpoint = getAppEndpoint()

describe('shoot api', () => {
  it('get shoot', async () => {
    nock(appEndpoint).get(`/shoots/${shoot.id}`).reply(200, shoot)
    const result = await getShoot(shoot.id)
    expect(result.id).toEqual(shoot.id)
  })

  it('update shoot', async () => {
    nock(appEndpoint)
      .put(`/shoots/${shoot.id}/files`)
      .reply(200, (x, y) => {
        return { ...shoot, ...JSON.parse(y.toString()) }
      })
    const result = await updateShootFiles(shoot.id, { originalFiles: { root: ['red.psd'] } })
    expect(result.id).toEqual(shoot.id)
    expect(result.original_files).toEqual({ root: ['red.psd'] })
  })
})
