import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'
import {fileTypeFromBuffer} from 'file-type'
import * as fs from 'node:fs'
import {dedent} from 'ts-dedent'

dotenv.config({path: ['.env', '.env.local']})

const anthropic = new Anthropic({
  // Define your Anthropic API key here or in .env file
  // apiKey: process.env["ANTHROPIC_API_KEY"]
})

export const annotate = async (path: string) => {
  const image = fs.readFileSync(path)
  const imageType = (await fileTypeFromBuffer(image))?.mime
  const imageBase64 = image.toString('base64')

  const msg = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageType as ('image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'),
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: dedent`
            """
            You are THE WORLD'S BEST AI IMAGE TAGGING EXPERT who won a $1M contest for writing the clearest, 
            most accurate, and most descriptive image captions.
            
            Please write a brief description of the cocktail in the json format with keys:
            - glass_type: oneOf('rocks glass', 'highball glass', 'martini glass', 'couple glass', 'can glass', anyString())
            - glass_count: oneOf('one cocktail', 'two cocktails', 'three cocktails', 'more than three cocktails')
            - glass_description: anyString()
            - fluid_color: anyString()
            - foam: anyString()
            - ice_amount: anyString()
            - ice_description: anyString()
            - garnish_type: anyString()
            - garnish_position: anyString()
            - background_details: anyString()
            - atmosphere_details: anyString()

            Example:
            - glass_type: rocks glass
            - glass_count: one cocktail
            - glass_description: tall glass, condensation-covered glass
            - fluid_color: amber fluid color
            - foam: without foam
            - ice_amount: one ice cube
            - ice_description: one big ice cube
            - garnish_type: orange slice garnish, mint garnish
            - garnish_position: garnish on the rim, garnish in the glass, garnish on the top of the glass
            - background_details: in bar
            - atmosphere_details: summer festival
            
            Special requirements:
            - Only return the json format
            """
          `,
          },
          {
            type: 'text',
            text: dedent`
            Combine image description with the following format:
            A cocktail, {glass_count}, {glass_type}, {glass_description}, {fluid_color}, {foam}, {ice_amount}, {ice_description}, {garnish_type}, {garnish_position}, {background_details}, {atmosphere_details}
            
            And add the combined description to the json with key: 'combined'.
          `,
          },
          {
            type: 'text',
            text: dedent`
            Transform the 'combined' key value for better sdxl caption understandability.
            Add the transformed 'combined' key value to the json with key: 'transformed'.
          `,
          },
        ],
      },
    ],
  })

  const resp = msg.content[0] as { text: string }
  const json = JSON.parse(resp.text)
  json.source = path
  return json
}
