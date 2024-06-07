import { Composer, InlineKeyboard } from 'grammy'
import axios from 'axios'
import gsmarena from 'gsmarena-api'
import { logCommand } from '../helpers.js'

const composer = new Composer()

composer.command('deviceinfo', async (ctx) => {
  const { text } = ctx.message
  logCommand(ctx)

  const name = text.substring(text.indexOf(' ') + 1)

  if (name == '/deviceinfo' || name == `/deviceinfo@${ctx.me.username}`) {
    ctx.reply('Please provide the name of the device!')
    return
  }

  const searchresult = await gsmarena.search.search(name)

  if (!searchresult.length) {
    return ctx.reply(
      `The device <code>${name}</code> does not exist!\nNote: If you are searching with codename, enter the device name instead.`,
      { parse_mode: 'HTML' }
    )
  }

  const device =
    searchresult.find(
      (device) => device.name.toLowerCase() === name.toLowerCase()
    ) || searchresult[0]

  const details = await gsmarena.catalog.getDevice(device.id)
  const { name: deviceName, detailSpec } = details

  let codename
  try {
    const url = await axios.get(
      'https://realmebotapi-1-e2272932.deta.app/' +
        encodeURIComponent(deviceName)
    )
    codename = url.data[0].codename
  } catch {}

  const getSpecValue = (categoryName, specName) =>
    detailSpec
      .find((cat) => cat.category === categoryName)
      ?.specifications.find((spec) => spec.name === specName)?.value ||
    'Unknown'

  const result = [
    `<b>Status:</b> ${getSpecValue('Launch', 'Status')}`,
    `<b>Display:</b>\n- ${getSpecValue('Display', 'Type')}\n- ${getSpecValue(
      'Display',
      'Size'
    )}\n- ${getSpecValue('Display', 'Resolution')}`,
    `<b>Platform:</b>\n- ${getSpecValue(
      'Platform',
      'Chipset'
    )}\n- ${getSpecValue('Platform', 'GPU')}`,
    `<b>Main Camera:</b>\n- ${
      getSpecValue('Main Camera', 'Single') ||
      getSpecValue('Main Camera', 'Dual')
    }\n- ${getSpecValue('Main Camera', 'Features')}`,
    `<b>Selfie Camera:</b>\n- ${
      getSpecValue('Selfie camera', 'Single') ||
      getSpecValue('Selfie camera', 'Dual')
    }`,
    `<b>Battery:</b>\n- ${getSpecValue('Battery', 'Type')}\n- ${getSpecValue(
      'Battery',
      'Charging'
    )}`,
  ]

  const keyboard = new InlineKeyboard().url(
    'View on GSMArena',
    `https://gsmarena.com/${device.id}.php`
  )

  ctx.reply(
    `<b>${deviceName}</b> - <code>${
      codename || 'unknown'
    }</code>\n\n${result.join('\n')}`,
    { parse_mode: 'HTML', reply_markup: keyboard }
  )
})

export default composer
