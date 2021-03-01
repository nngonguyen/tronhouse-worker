import nock from 'nock'

import { getAppEndpoint } from '../config'
import { getShoot, Shoot, updateShootFiles } from '../shoots'

const shoot: Shoot = {
  id: '9HFxlk9v-1-Jb1J-hinh_chi_tiet-0',
  paths: {
    final: 'customers/J7dJ/9HFxlk9v/final/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0',
    original: 'orders/9HFxlk9v/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0/original',
    post_script: 'scripts/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0/post.jsx',
    pre_action: 'orders/9HFxlk9v/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0/pre',
    pre_script: 'scripts/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0/pre.jsx',
    preview: 'public/9HFxlk9v/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0',
    retouched: 'orders/9HFxlk9v/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0/retouched',
    wm: 'customers/J7dJ/9HFxlk9v/wm/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0',
  },
  pre_script_content: 'var xxx // pre script',
  post_script_content: 'var xxx // post script',
}

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
