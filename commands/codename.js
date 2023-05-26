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

    const encodedDeviceName = encodeURIComponent(devicename)
    const url = `https://realmebotapi-1-e2272932.deta.app/${encodedDeviceName}`

    try {
      const response = await axios.get(url)
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
        }
      )
    } catch (error) {
      if (error.response && error.response.status === 404) {
        ctx.reply(`The device <code>${devicename}</code> does not exist!`, {
          parse_mode: 'HTML',
        })
      } else {
        ctx.reply('Oops, an error occurred while processing your request!')
      }
    }
  },
}
