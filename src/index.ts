import chokidar from 'chokidar'

const root = '/Users/achilles/Workspaces/resources'

// Watch for original files
chokidar.watch(`${root}/*/original/*`, { ignoreInitial: true }).on('all', (event, path) => {
  console.log(event, path)
  const shootId = checkShootStatusByOriginalFile(path)
  console.log('original file uploaded', { shootId })
})

// Watch for retouched files
chokidar.watch(`${root}/*/retouched.*`, { ignoreInitial: true }).on('all', (event, path) => {
  console.log(event, path)
  const shootId = checkShootStatusByRetouchedFile(path)
  console.log('retouched file uploaded', { shootId })
})

function checkShootStatusByOriginalFile(filePath: string) {
  const [, , shootId] = filePath.split(/\//g).reverse()
  return shootId
}

function checkShootStatusByRetouchedFile(filePath: string) {
  const [, shootId] = filePath.split(/\//g).reverse()
  return shootId
}

function publishRunPreAction(shootId: string) {}

function publishRunPostAction(shootId: string) {}

function consumePreAction(shootId: string) {
  // Step 1: Make Photoshop script jsx file
  // Step 2: Execute that file
}

function consumePostAction(shootId: string) {
  // Step 1: Make Photoshop script jsx file
  // Step 2: Execute that file}
}
