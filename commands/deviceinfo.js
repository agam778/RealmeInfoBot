const axios = require('axios')
const { InlineKeyboard } = require('grammy')
const gsmarena = require('gsmarena-api')

module.exports = {
  name: 'deviceinfo',
  description: 'Get the details of the mentioned device',
  usage: '/deviceinfo <device-name>',
  example: `/deviceinfo Realme X2 Pro`,
  handler: async (ctx) => {
    const { message } = ctx
    const { text } = message

    const name = text.substring(text.indexOf(' ') + 1)

    if (name == '/deviceinfo' || name == `/deviceinfo@${ctx.me.username}`) {
      ctx.reply('Please provide the name of the device!')
      return
    }

    const device = await gsmarena.search.search(name)

    if (device.length === 0) {
      ctx.reply(
        `The device <code>${name}</code> does not exist!\nNote: If you are searching with codename, enter the device name instead.`,
        {
          parse_mode: 'HTML',
        }
      )
      return
    }

    const details = await gsmarena.catalog.getDevice(device[0].id)
    const { name: deviceName, detailSpec } = details

    const url = await axios
      .get(
        'https://realmebotapi-1-e2272932.deta.app/' +
          encodeURIComponent(deviceName)
      )
      .catch((err) => {})

    if (url) {
      var codename = url.data[0].codename
    }

    const result = []

    const statusValue = detailSpec
      .find((category) => category.category === 'Launch')
      ?.specifications.find((spec) => spec.name === 'Status')?.value

    const networkValue = detailSpec
      .find((category) => category.category === 'Network')
      ?.specifications.find((spec) => spec.name === 'Technology')?.value

    const weightValue = detailSpec
      .find((category) => category.category === 'Body')
      ?.specifications.find((spec) => spec.name === 'Weight')?.value

    const displayCategory = detailSpec.find(
      (category) => category.category === 'Display'
    )
    const typeValue = displayCategory?.specifications.find(
      (spec) => spec.name === 'Type'
    ).value
    const sizeValue = displayCategory?.specifications.find(
      (spec) => spec.name === 'Size'
    ).value
    const resolutionValue = displayCategory?.specifications.find(
      (spec) => spec.name === 'Resolution'
    ).value

    const platformCategory = detailSpec.find(
      (category) => category.category === 'Platform'
    )
    const chipsetValue = platformCategory?.specifications.find(
      (spec) => spec.name === 'Chipset'
    ).value
    const cpuValue = platformCategory?.specifications.find(
      (spec) => spec.name === 'CPU'
    ).value
    const gpuValue = platformCategory?.specifications.find(
      (spec) => spec.name === 'GPU'
    ).value

    const memoryValue = detailSpec
      .find((category) => category.category === 'Memory')
      ?.specifications.find((spec) => spec.name === 'Internal')?.value

    const sensorsValue = detailSpec
      .find((category) => category.category === 'Features')
      ?.specifications.find((spec) => spec.name === 'Sensors')?.value

    const batteryValue = detailSpec
      .find((category) => category.category === 'Battery')
      ?.specifications.find((spec) => spec.name === 'Type')?.value

    result.push(`<b>Status:</b> ${statusValue || 'Unknown'}`)
    result.push(`<b>Network:</b> ${networkValue || 'Unknown'}`)
    result.push(`<b>Weight:</b> ${weightValue || 'Unknown'}`)
    result.push(
      `<b>Display:</b>\n- ${typeValue || 'Unknown'}\n- ${
        sizeValue || 'Unknown'
      }\n- ${resolutionValue || 'Unknown'}`
    )
    result.push(
      `<b>Platform:</b>\n- ${chipsetValue || 'Unknown'}\n- ${
        cpuValue || 'Unknown'
      }\n- ${gpuValue || 'Unknown'}`
    )
    result.push(`<b>Memory:</b> ${memoryValue || 'Unknown'}`)
    result.push(`<b>Sensors:</b> ${sensorsValue || 'Unknown'}`)
    result.push(`<b>Battery:</b> ${batteryValue || 'Unknown'}`)

    const keyboard = new InlineKeyboard()
    keyboard.url('View on GSMArena', `https://gsmarena.com/${device[0].id}.php`)

    ctx.reply(
      `<b>${deviceName}</b> - <code>${
        codename || 'unknown'
      }</code>\n\n${result.join('\n')}` || 'Unknown',
      {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      }
    )
  },
}
