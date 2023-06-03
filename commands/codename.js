const axios = require('axios')
const { InlineKeyboard } = require('grammy')

module.exports = {
  name: 'codename',
  description: "Get device's codename from the name",
  handler: async (ctx) => {
    const { message } = ctx
    const { text } = message

    const devicename = text.substring(text.indexOf(' ') + 1)

    if (devicename == '/codename' || devicename == `/codename@${ctx.me.username}`) {
      ctx.reply('Please provide the name of the device!')
      return
    }

    const encodedDeviceName = encodeURIComponent(devicename)
    const url = `https://realmebotapi-1-e2272932.deta.app/${encodedDeviceName}`

    const keyboard = new InlineKeyboard().url(
      'Device/Codename is missing?',
      'https://github.com/agam778/realmebot-api#contributing'
    )

    const response = await axios.get(url).catch((err) => {
      if (err.response.status === 404) {
        ctx.reply(`The device <code>${devicename}</code> does not exist!`, {
          parse_mode: 'HTML',
          reply_markup: keyboard,
        })
      }
      return
    })

    if (response) {
      const data = response.data

      if (data[0].codename === devicename) {
        ctx.reply(
          `Oops! Looks like <code>${devicename}</code> is the codename of the device, and not the name!\n\nUse /whatis instead if you want to get the name.`,
          {
            parse_mode: 'HTML',
          }
        )
        return
      }

      const result = data
        .map(
          (device) => `<b>${device.model}:</b> <code>${device.codename}</code>`
        )
        .join('\n')

      ctx.reply(
        `The codename for <code>${devicename}</code> is:\n\n${result}`,
        {
          parse_mode: 'HTML',
          reply_markup: keyboard,
        }
      )
    }
  },
}
