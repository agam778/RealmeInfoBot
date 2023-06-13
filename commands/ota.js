const { exec } = require('child_process')
const { join } = require('path')
const { InlineKeyboard } = require('grammy')
const randomstring = require('randomstring')
const fs = require('fs').promises

module.exports = {
  name: 'ota',
  description: 'Request and send OTA packages from BBK server(s)',
  handler: async (ctx) => {
    const { message } = ctx
    const { text } = message

    if (text === '/ota' || text === `/ota@${ctx.me.username}`) {
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

    const details = text.substring(text.indexOf(' ') + 1).split(' | ')
    const otaJsonPath = join(__dirname, '..', `ota-${randomchar}.json`)

    try {
      await executeRealmeOtaCommand(details, otaJsonPath)
      const ota = require(otaJsonPath)
      const { androidVersion, versionName } = ota

      let messageText = `<b>Android Version:</b> <code>${androidVersion}</code>\n<b>Version Name:</b> <code>${versionName}</code>\n\n`

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

      const keyboard = new InlineKeyboard().url(
        'Description',
        ota.description.url ||
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
          `Something went wrong! Make sure that you've provided correct details.`,
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
          `Something went wrong! Make sure that you've provided correct details.\n\nError:\n<code>${error}</code>`,
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
          `Something went wrong! Make sure that you've provided correct details.`,
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
  },
}

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
    await fs.access(filePath)
    await fs.unlink(filePath)
  } catch (error) {
    console.error('Error deleting file:', error)
  }
}
