const axios = require('axios')
const { InlineKeyboard } = require('grammy')

module.exports = {
  name: 'whatis',
  description: "Get device's name from the codename",
  handler: async (ctx) => {
    const { message } = ctx
    const { text } = message

    const codename = text.substring(text.indexOf(' ') + 1)

    if (!codename) {
      ctx.reply('Please provide the codename!')
      return
    }

    const url = `https://realmebotapi-1-e2272932.deta.app/${codename}`

    const keyboard = new InlineKeyboard().url(
      'Device/Codename is missing?',
      'https://github.com/agam778/realmebot-api#contributing'
    )

    try {
      const response = await axios.get(url)
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
        const { series, model, codename } = device
        result.push(
          `<b>${series} Series:</b> ${model}: <code>${codename}</code>`
        )
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
    } catch (error) {
      ctx.reply(
        `The device with codename <code>${codename}</code> is not found!`,
        {
          parse_mode: 'HTML',
          reply_markup: keyboard,
        }
      )
    }
  },
}
