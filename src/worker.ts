import { exec } from 'child_process'
import Debug from 'debug'
import faktory from 'faktory-worker'
import { JobFunction } from 'faktory-worker/lib/worker'
import fs from 'fs'
import path from 'path'
import { Client } from 'ssh2'; // Import SSH2 client

import { getAssetsDir, getScriptsDir } from './config'
import { downloadOrderImages } from './orders'
// import { uploadPackageItem } from './package-items'
import { getShoot, getShootsByPackageId, updateShootFiles } from './shoots/api'
import { Shoot } from './shoots/types'
import {
  createShootDirectories,
  createShootPostScript,
  createShootPostScript,
  createShootPreScript,
  getOriginalFilesByShoot,
} from './shoots/util'

const debug = Debug('tronhouse-worker:worker')

export const photoshopPath = 'C:/Program Files/Adobe/Adobe Photoshop 2025/Photoshop.exe'

// SSH Configuration for preVM
const sshConfig = {
  host: '192.168.1.202', // Replace with preVM's IP
  port: 22,
  username: 'admin',
  password: '2407',
};

// Helper to run SSH commands
async function runSshCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let result = '';
    conn
      .on('ready', () => {
        debug('SSH Connection Ready');
        conn.exec(command, (err, stream) => {
          if (err) return reject(err);
          stream
            .on('data', (data) => {
              debug(`STDOUT: ${data}`);
              result += data.toString();
            })
            .stderr.on('data', (data) => {
              debug(`STDERR: ${data}`);
            });
          stream.on('close', (code, signal) => {
            debug(`Stream Closed: code=${code}, signal=${signal}`);
            conn.end();
            resolve(result);
          });
        });
      })
      .on('error', (err) => reject(err))
      .connect(sshConfig);
  });
}
/**
 * Download all order images, update shoot files to the latest state in case files is changed
 * Retun the updated shoot
 * @param shoot
 */
export async function ensurePreScript(shoot: Shoot) {
  const originalFiles = await getOriginalFilesByShoot(shoot.order_id, shoot.id)
  await updateShootFiles(shoot.id, { originalFiles })
  if (!fs.existsSync) {
    await downloadOrderImages(shoot.order_id)
  }
  if (!fs.existsSync) {
    await downloadOrderImages(shoot.order_id)
  }
  return getShoot(shoot.id)
}

const assetsDir = getAssetsDir()
const scriptsDir = getScriptsDir()
// Modified execWithLock to run over SSH
async function execWithLockOverSsh(cmd: string, lockFilePath: string, timeout = 120 * 1000) {
  let timer = timeout;
  fs.writeFileSync(lockFilePath, ''); // Create the lock file
  return new Promise((resolve, reject) => {
    runSshCommand(cmd)
      .then(() => {
        const interval = setInterval(() => {
          if (timer < 0) {
            clearInterval(interval);
            fs.unlinkSync(lockFilePath); // Remove the lock file on timeout
            reject('Exec timeout');
          }
          const isRemoved = !fs.existsSync(lockFilePath);
          if (isRemoved) {
            clearInterval(interval);
            resolve(true);
          } else {
            timer -= 1000;
          }
        }, 1000);
      })
      .catch((err) => {
        fs.unlinkSync(lockFilePath); // Ensure the lock file is cleaned up on error
        reject(err);
      });
  });
}


// Updated executePreScript to run over SSH
export async function executePreScript(shoot: Shoot) {
  const scriptPath = await createShootPreScript(shoot); // Create the Photoshop script
  const lockFilePath = path.join(getAssetsDir(), 'locks', `${shoot.id}.pre`);
  const cmd = `"${photoshopPath}" "${scriptPath}"`; // Photoshop command with script path
  return execWithLockOverSsh(cmd, lockFilePath); // Execute command over SSH
}

export async function executePostScript(shoot: Shoot) {
  const scriptPath = await createShootPostScript(shoot)
  const lockFilePath = path.join(assetsDir, 'locks', `${shoot.id}.post`)
  const cmd = `"${photoshopPath}" "${scriptPath}"`
  return execWithLockOverSsh(cmd, lockFilePath)
}

export const handleShootTransited = async (payload: Shoot) => {
  try {
    console.log('handle shoot_transited', payload.id, payload.state)
    const shoot = await getShoot(payload.id)
    switch (payload.state) {
      case 'shot':
        await ensurePreScript(shoot)
        await executePreScript(shoot)
        // await uploadPackageItem(shoot.package_item_id)
        break
      case 'retouched':

        await executePostScript(shoot)
        // console.log('Run post-action', shoot.id)
        // return 1

        await executePostScript(shoot)
        // console.log('Run post-action', shoot.id)
        // return 1
    }
  } catch (err) {
    console.error(err)
  }
}

export const handlePackageCreated = async ({ id }: { id: string }) => {
  const shoots = await getShootsByPackageId(id)
  const files = await Promise.all(shoots.map(createShootDirectories))

  debug(`Generate ${files.length} files`)
  return files
}

async function run() {
  const worker = await faktory.work({
    host: '192.53.114.99',
    password: 'a432cb46d5058a7b',
    queues: ['nodejs'],
    concurrency: 1,
    poolSize: 1,
  })

    // Test SSH Connection on Start
    try {
      const connTest = await runSshCommand('echo "SSH connection successful"');
      debug(connTest);
    } catch (err) {
      console.error('SSH Connection Failed:', err);
    }
  

  worker.register('package_created', handlePackageCreated as JobFunction)
  worker.register('shoot_transited', handleShootTransited as JobFunction)
}

run().catch(console.error)
