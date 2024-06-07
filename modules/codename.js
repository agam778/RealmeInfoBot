import { Composer, InlineKeyboard } from 'grammy'
import axios from 'axios'
import { logCommand } from '../helpers.js'

const composer = new Composer()

composer.command('codename', async (ctx) => {
  const { text } = ctx.message
  logCommand(ctx)

  const devicename = text.substring(text.indexOf(' ') + 1)

  if (
    devicename == '/codename' ||
    devicename == `/codename@${ctx.me.username}`
  ) {
    ctx.reply('Please provide the name of the device!')
    return
  }

  const url = `https://realmebotapi-1-e2272932.deta.app/${encodeURIComponent(
    devicename
  )}`
  const keyboard = new InlineKeyboard().url(
    'Device/Codename is missing?',
    'https://github.com/agam778/realmebot-api#contributing'
  )

  try {
    const response = await axios.get(url)

    if (response.data[0].codename === devicename) {
      return ctx.reply(
        `Oops! Looks like <code>${devicename}</code> is the codename of the device, and not the name!\n\nUse /whatis instead if you want to get the name.`,
        { parse_mode: 'HTML' }
      )
    }

    const result = response.data
      .map(
        (device) => `<b>${device.model}:</b> <code>${device.codename}</code>`
      )
      .join('\n')

    if (result.length > 4096) {
      return ctx.reply('The result is too long! Please be more specific.')
    }

    ctx.reply(`The codename for <code>${devicename}</code> is:\n\n${result}`, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    })
  } catch (err) {
    if (err.response && err.response.status === 404) {
      ctx.reply(`The device <code>${devicename}</code> does not exist!`, {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      })
    }
  }
})

export default composer
