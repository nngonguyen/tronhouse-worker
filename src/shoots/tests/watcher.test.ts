import del from 'del'
import delay from 'delay'
import fs from 'fs'
import makeDir from 'make-dir'
import nock from 'nock'
import path from 'path'
import { promisify } from 'util'

import { getAppEndpoint, getAssetsDir } from '../../config'
import { Shoot } from '../types'
import { getAssetPath } from '../util'
import { watchOriginalFiles } from '../watcher'
import { createShoot } from './fixtures'

const writeFileAsync = promisify(fs.writeFile)
const appEndpoint = getAppEndpoint()

async function makeMockFiles(shoot: Shoot, files: string[]) {
  const filePaths = files.map((f) => {
    return path.join(getAssetPath(shoot.paths.original), f)
  })
  await Promise.all(
    filePaths.map(async (f) => {
      await makeDir(path.dirname(f))
      await writeFileAsync(f, 'Some content')
    }),
  )
  return filePaths
}

function createNock(shoot: Shoot, cb: jest.Mock<any, any>) {
  return nock(appEndpoint)
    .put(`/shoots/${shoot.id}/files`)
    .reply(200, (_, body) => {
      const json = JSON.parse(body.toString())
      cb(json)
      return { ...shoot, ...json }
    })
}

describe('watch original files', () => {
  afterAll(async () => {
    await del(getAssetsDir())
  })

  it('add new', async () => {
    const listener = jest.fn()
    const shoot = createShoot('id-01')
    const scope = createNock(shoot, listener)

    const watcher = watchOriginalFiles()

    await makeMockFiles(shoot, ['red.psd'])
    await delay(300)
    watcher.close()

    expect(scope.isDone()).toBeTruthy()
    expect(listener.mock.calls[0]).toEqual([{ original_files: { root: ['red.psd'] } }])
  })

  it('add exists', async () => {
    const listener = jest.fn()
    const shoot = createShoot('id-02')
    const scope = createNock(shoot, listener)

    await makeMockFiles(shoot, ['red.psd'])
    await delay(150)
    const watcher = watchOriginalFiles()

    await makeMockFiles(shoot, ['green.psd'])
    await delay(300)
    watcher.close()

    expect(scope.isDone()).toBeTruthy()
    expect(listener.mock.calls[0]).toEqual([{ original_files: { root: ['green.psd', 'red.psd'] } }])
  })

  it('add with nested', async () => {
    const listener = jest.fn()
    const shoot = createShoot('id-03')
    const scope = createNock(shoot, listener)

    await makeMockFiles(shoot, ['red.psd'])
    await delay(150)
    const watcher = watchOriginalFiles()

    await makeMockFiles(shoot, ['extra/1.psd'])
    await delay(300)

    watcher.close()
    expect(scope.isDone()).toBeTruthy()
    expect(listener.mock.calls[0]).toEqual([
      { original_files: { root: ['red.psd'], extra: ['1.psd'] } },
    ])
  })

  it('update', async () => {
    const listener = jest.fn()
    const shoot = createShoot('id-03')
    const scope = createNock(shoot, listener)

    const [file] = await makeMockFiles(shoot, ['red.psd', 'extra/1.psd', 'extra/2.psd'])
    await delay(150)
    const watcher = watchOriginalFiles()

    await writeFileAsync(file, 'updated data')
    await delay(300)

    watcher.close()
    expect(scope.isDone()).toBeTruthy()
    expect(listener.mock.calls[0]).toEqual([
      { original_files: { root: ['red.psd'], extra: ['1.psd', '2.psd'] } },
    ])
  })

  it('delete', async () => {
    const listener = jest.fn()
    const shoot = createShoot('id-03')
    const scope = createNock(shoot, listener)

    const [, file] = await makeMockFiles(shoot, ['red.psd', 'extra/1.psd', 'extra/2.psd'])
    await delay(150)
    const watcher = watchOriginalFiles()
    await delay(150)
    await del(file)
    await delay(300)

    watcher.close()
    expect(scope.isDone()).toBeTruthy()
    expect(listener.mock.calls[0]).toEqual([
      { original_files: { root: ['red.psd'], extra: ['2.psd'] } },
    ])
  })
})
