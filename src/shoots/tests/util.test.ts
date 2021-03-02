import del from 'del'
import fs from 'fs'
import makeDir from 'make-dir'
import path from 'path'
import { promisify } from 'util'

const writeFileAsync = promisify(fs.writeFile)

import { getAssetsDir } from '../../config'
import {
  createShootDirectories,
  createShootPostScript,
  createShootPreScript,
  getAssetPath,
  getOriginalFiles,
  getShootId,
} from '../util'
import { shoot } from './fixtures'

const assetsDir = getAssetsDir()

describe('shoot util', () => {
  it('get shoot id', () => {
    const shootId = getShootId('orders/9HFxlk9v/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0/original/red.psd')
    expect(shootId).toEqual('9HFxlk9v-1-Jb1J-hinh_chi_tiet-0')
  })
})

describe('shoots', () => {
  afterEach(async () => {
    await del(assetsDir)
  })

  describe('create shoot directories', () => {
    it('valid', async () => {
      const directories = await createShootDirectories(shoot)
      expect(directories.length).toBeGreaterThan(0)
      directories.forEach((directory) => {
        const exists = fs.existsSync(directory)
        expect(exists).toBeTruthy()
      })
    })
  })

  describe('create pre script', () => {
    it('valid', async () => {
      const filePath = await createShootPreScript(shoot)
      const content = fs.readFileSync(filePath, 'utf-8')
      expect(content).toEqual(shoot.pre_script_content)
    })
  })

  describe('create post script', () => {
    it('valid', async () => {
      const filePath = await createShootPostScript(shoot)
      const content = fs.readFileSync(filePath, 'utf-8')
      expect(content).toEqual(shoot.post_script_content)
    })
  })

  describe('read shoot original files', () => {
    const dir = 'orders/9HFxlk9v/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0/original'
    const cases = [
      {
        name: '1 psd file',
        files: ['red.psd'],
        expectFiles: {
          root: ['red.psd'],
        },
      },
      {
        name: 'multiple psd file',
        files: ['red.psd', 'green.psd'],
        expectFiles: {
          root: ['green.psd', 'red.psd'],
        },
      },
      {
        name: 'multiple psd file with directory',
        files: ['red.psd', 'green.psd', 'extra/1.psd', 'extra/2.psd'],
        expectFiles: {
          root: ['green.psd', 'red.psd'],
          extra: ['1.psd', '2.psd'],
        },
      },
      {
        name: 'multiple psd file with nested directory',
        files: [
          'red.psd',
          'green.psd',
          'extra/a/1.psd',
          'extra/a/2.psd',
          'extra/b/1.psd',
          'extra/b/2.psd',
        ],
        expectFiles: {
          root: ['green.psd', 'red.psd'],
          'extra/a': ['1.psd', '2.psd'],
          'extra/b': ['1.psd', '2.psd'],
        },
      },
      {
        name: 'ignore files not match pattern',
        files: ['red.psd', 'green.psd', 'a.jpg', 'b.jpg'],
        expectFiles: {
          root: ['green.psd', 'red.psd'],
        },
      },
    ]

    cases.forEach(({ name, files, expectFiles }) => {
      it(name, async () => {
        const [firstFile] = await makeMockShootFiles(dir, files)
        const originalFiles = await getOriginalFiles(firstFile)
        expect(originalFiles).toEqual(expectFiles)
      })
    })
  })
})

async function makeMockShootFiles(dir: string, files: string[]) {
  const filesToCreate = files.map((file) => getAssetPath(`${dir}/${file}`))
  await Promise.all(
    filesToCreate.map(async (f) => {
      await makeDir(path.dirname(f))
      await writeFileAsync(f, 'mock content')
    }),
  )
  return filesToCreate
}
