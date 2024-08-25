import {annotate} from '#/index'
import * as fs from 'node:fs'
import Path from 'node:path'
import {assert, describe, test} from 'vitest'

describe('annotate', async () => {
  const dir = './src/__dataset__'
  const images = fs.readdirSync(dir)

  images.forEach(image => {
    const imageBasename = Path.basename(image)
    const imageExtname = Path.extname(image)

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    if (!allowedExtensions.includes(imageExtname)) return
    if (images.includes(`${imageBasename}.json`)) return

    test(image, async () => {
      const path = `${dir}/${image}`
      const json = await annotate(path)

      fs.writeFileSync(`${dir}/${imageBasename}.json`, JSON.stringify(json, null, 2))
      fs.writeFileSync(`${dir}/${imageBasename}.c.txt`, json.combined)
      fs.writeFileSync(`${dir}/${imageBasename}.t.txt`, json.transformed)

      assert(true)
    })
  })
})
