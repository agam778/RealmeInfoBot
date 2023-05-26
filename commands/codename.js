const axios = require('axios')

module.exports = {
  name: 'codename',
  description: "Get device's codename from the name",
  handler: async (ctx) => {
    const { message } = ctx
    const { text } = message

    const devicename = text.substring(text.indexOf(' ') + 1)

    if (!devicename) {
      ctx.reply('Please provide the device name!')
      return
    }

    const url = `https://realmebotapi-1-e2272932.deta.app/${devicename.replace(
      ' ',
      '%20'
    )}`

    try {
      const response = await axios.get(url)
      const data = response.data
      const result = []

      if (data[0].codename === devicename) {
        ctx.reply(
          `Oops! Looks like <code>${devicename}</code> is the codename of the device, and not the name!\n\nUse /whatis instead if you want to get the name.`,
          {
            parse_mode: 'HTML',
          }
        )
        return
      }

      for (const device of data) {
        const { series, model, codename } = device
        result.push(`<b>${model}:</b> <code>${codename}</code>`)
      }

      ctx.reply(
        `The codename for <code>${devicename}</code> is:\n\n${result.join(
          '\n'
        )}`,
        {
          parse_mode: 'HTML',
        }
      )
    } catch (error) {
      ctx.reply(`The device <code>${devicename}</code> does not exist!`, {
        parse_mode: 'HTML',
      })
    }
  },
}
