import { exec } from 'child_process'
import { join } from 'path'
import { Composer, InlineKeyboard } from 'grammy'
import randomstring from 'randomstring'
import fs from 'fs'
import path from 'path'
import { logCommand } from '../helpers.js'
const __dirname = path.dirname(new URL(import.meta.url).pathname)

const composer = new Composer()

composer.command('ota', async (ctx) => {
  const { message } = ctx
  const { text } = message
  logCommand(ctx)

  if (text.split(' ').length < 2) {
    ctx.reply(
      'Please provide me the details!\n\n<b>Usage:</b> <code>/ota region_code | codename | ota_version | realmeui_version</code>\n<b>Example:</b> <code>/ota 2 | RMX2020 | RMX2020_11.C.12 | 2</code>',
      {
        parse_mode: 'HTML',
      }
    )
    return
  }

  const randomchar = randomstring.generate({
    length: 5,
    charset: 'alphabetic',
  })

  const details = text.split(' ')[1].split(' | ')
  const otaJsonPath = join(__dirname, '..', `ota-${randomchar}.json`)

  try {
    await executeRealmeOtaCommand(details, otaJsonPath)
    const ota = JSON.parse(await fs.promises.readFile(otaJsonPath, 'utf-8'))

    let messageText = `<b>Android Version:</b> <code>${
      ota.androidVersion || ota.newAndroidVersion || 'N/A'
    }</code>\n<b>Version Name:</b> <code>${
      ota.versionName || ota.aid
    }</code>\n\n`

    if (ota.components) {
      for (const component of ota.components) {
        const componentName = component.componentName
        const downloadUrl = component.componentPackets
          ? component.componentPackets.url
          : ''

        messageText += `<b>Component Name:</b> <code>${componentName}</code>\n`
        messageText += `<b>Download:</b> ${
          downloadUrl ? `<a href="${downloadUrl}">${componentName}</a>` : 'N/A'
        }\n\n`
      }
    } else {
      const downloadUrl = ota.down_url

      messageText += `<b>Download:</b> ${
        downloadUrl ? `<a href="${downloadUrl}">Download</a>` : 'N/A'
      }\n`
    }

    const keyboard = new InlineKeyboard().url(
      'Description',
      ota.description.url ||
        ota.description ||
        'https://www.realme.com/in/support/software-update'
    )
    const messageOptions = {
      reply_markup: keyboard,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }

    ctx.reply(messageText, messageOptions)

    setTimeout(async () => {
      await deleteFileIfExists(otaJsonPath)
    }, 2000)
  } catch (err) {
    if (
      err.toString().includes('Command failed') &&
      !err.toString().includes('realme-ota: error:')
    ) {
      ctx.reply(
        `Something went wrong! Make sure that you've provided correct details, or try again later.`,
        {
          parse_mode: 'HTML',
        }
      )
      const errorMessage = `Command: <code>${text}</code>\n\nUser: ${ctx.from.first_name} ${ctx.from.last_name} (${ctx.from.username})\n\nGroup: <code>${ctx.chat.title}</code>\n\nError: <code>${err}</code>`
      ctx.reply(`Oops, an error occurred!\n\n${errorMessage}`, {
        parse_mode: 'HTML',
        chat_id: process.env.LOG_CHANNEL,
      })
    } else if (
      err.toString().includes('Command failed') &&
      err.toString().includes('realme-ota: error:')
    ) {
      const error = (err.toString().match(/realme-ota: error:.*/) || [])[0]
      ctx.reply(
        `Something went wrong! Make sure that you've provided correct details, or try again later.\n\nError:\n<code>${error}</code>`,
        {
          parse_mode: 'HTML',
        }
      )
      const errorMessage = `Command: <code>${text}</code>\n\nUser: ${ctx.from.first_name} ${ctx.from.last_name} (${ctx.from.username})\n\nGroup: <code>${ctx.chat.title}</code>\n\nError: <code>${error}</code>`
      ctx.reply(`Oops, an error occurred!\n\n${errorMessage}`, {
        parse_mode: 'HTML',
        chat_id: process.env.LOG_CHANNEL,
      })
    } else {
      ctx.reply(
        `Something went wrong! Make sure that you've provided correct details, or try again later.`,
        {
          parse_mode: 'HTML',
        }
      )
      const errorMessage = `Command: <code>${text}</code>\n\nUser: ${ctx.from.first_name} ${ctx.from.last_name} (${ctx.from.username})\n\nGroup: <code>${ctx.chat.title}</code>\n\nError: <code>${err}</code>`
      ctx.reply(`Oops, an error occurred!\n\n${errorMessage}`, {
        parse_mode: 'HTML',
        chat_id: process.env.LOG_CHANNEL,
      })
    }
    setTimeout(async () => {
      await deleteFileIfExists(otaJsonPath)
    }, 2000)
  }
})

async function executeRealmeOtaCommand(details, otaJsonPath) {
  const command = `realme-ota -s -r ${details[0]} ${details[1]} ${details[2]}_0000_000000000000 ${details[3]} 0 > ${otaJsonPath}`

  return new Promise((resolve, reject) => {
    exec(command, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

async function deleteFileIfExists(filePath) {
  try {
    fs.access(filePath, function (err) {
      if (!err) {
        fs.unlink(filePath, function (err) {
          if (err) throw err
        })
      }
    })
  } catch (error) {
    console.error('Error deleting file:', error)
  }
}

export default composer
