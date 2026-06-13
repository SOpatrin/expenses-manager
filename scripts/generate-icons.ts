import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join } from 'path'

const root = join(import.meta.dirname, '..')
const svg = readFileSync(join(root, 'public/icon.svg'))

const sizes = [
  { name: 'favicon.ico', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
]

async function main() {
  for (const { name, size } of sizes) {
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(join(root, 'public', name))
    console.log(`✓ public/${name}`)
  }
}

main()
