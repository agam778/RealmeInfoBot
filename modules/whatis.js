import { Composer, InlineKeyboard } from 'grammy'
import { logCommand } from '../helpers.js'
import axios from 'axios'

const composer = new Composer()

composer.command('whatis', async (ctx) => {
  const { message } = ctx
  const { text } = message
  logCommand(ctx)

  const codename = text.substring(text.indexOf(' ') + 1)

  if (codename == '/whatis' || codename == `/whatis@${ctx.me.username}`) {
    ctx.reply('Please provide the codename of the device!')
    return
  }

  const url = `https://realmebotapi-1-e2272932.deta.app/${codename}`

  const keyboard = new InlineKeyboard().url(
    'Device/Codename is missing?',
    'https://github.com/agam778/realmebot-api#contributing'
  )

  const response = await axios.get(url).catch((err) => {
    if (err.response.status === 404) {
      ctx.reply(
        `The device with codename <code>${codename}</code> is not found!`,
        {
          parse_mode: 'HTML',
          reply_markup: keyboard,
        }
      )
    }
    return
  })

  if (response) {
    const data = response.data

    const result = []

    if (data[0].model.toLowerCase().includes(codename.toLowerCase())) {
      ctx.reply(
        `Oops! Looks like <code>${codename}</code> is the name of the device, and not the codename!\n\nUse /codename instead if you want to get the codename.`,
        {
          parse_mode: 'HTML',
        }
      )
      return
    }

    for (const device of data) {
      const { model, codename } = device
      result.push(`<b>${model}:</b> <code>${codename}</code>`)
    }

    ctx.reply(
      `The device(s) with codename <code>${codename}</code> is:\n\n${result.join(
        '\n'
      )}`,
      {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      }
    )
  }
})

export default composer
