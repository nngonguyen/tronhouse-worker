import { getPostScript, getPreScript } from '../api'

const shootId = 'K94Z4DODTX47-1-3BFY-hinh_concept-0'
/** This is e2e test */
describe('get shoot script', () => {
  it('pre', async () => {
    const result = await getPreScript(shootId)
    expect(result).toMatch(/var paths =/)
  })

  it('post', async () => {
    const result = await getPostScript(shootId)
    expect(result).toMatch(/var paths =/)
  })
})
