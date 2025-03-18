import { Composer, InlineKeyboard } from 'grammy'
import axios from 'axios'
import gsmarena from 'gsmarena-api'
import { logCommand } from '../helpers.js'

const composer = new Composer()

composer.command('deviceinfo', async (ctx) => {
  const { message } = ctx
  const { text } = message
  logCommand(ctx)

  const name = text.substring(text.indexOf(' ') + 1)

  if (name == '/deviceinfo' || name == `/deviceinfo@${ctx.me.username}`) {
    ctx.reply('Please provide the name of the device!')
    return
  }

  const searchresult = await gsmarena.search.search(name)

  if (searchresult.length === 0) {
    ctx.reply(
      `The device <code>${name}</code> does not exist!\nNote: If you are searching with codename, enter the device name instead.`,
      {
        parse_mode: 'HTML',
      }
    )
    return
  }

  const device =
    searchresult.find(
      (device) => device.name.toLowerCase() === name.toLowerCase()
    ) || searchresult[0]

  const details = await gsmarena.catalog.getDevice(device.id)
  const { name: deviceName, detailSpec } = details

  const url = await axios
    .get('https://rbapi.up.railway.app/' + encodeURIComponent(deviceName))
    .catch((err) => {})

  if (url) {
    var codename = url.data[0].codename
  }

  const result = []

  const statusValue = detailSpec
    .find((category) => category.category === 'Launch')
    ?.specifications.find((spec) => spec.name === 'Status')?.value

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
  const gpuValue = platformCategory?.specifications.find(
    (spec) => spec.name === 'GPU'
  ).value

  const mainCameraName = detailSpec.find(
    (category) => category.category === 'Main Camera'
  )?.specifications[0].name

  const mainCameraValue = detailSpec.find(
    (category) => category.category === 'Main Camera'
  )?.specifications[0].value

  const mainCameraFeatures = detailSpec.find(
    (category) => category.category === 'Main Camera'
  )?.specifications[1].value

  const selfieCameraName = detailSpec.find(
    (category) => category.category === 'Selfie camera'
  )?.specifications[0].name

  const selfieCameraValue = detailSpec.find(
    (category) => category.category === 'Selfie camera'
  )?.specifications[0].value

  const batterySpecs = detailSpec
    .find((category) => category.category === 'Battery')
    ?.specifications.find((spec) => spec.name === 'Type')?.value

  const batteryValue = detailSpec
    .find((category) => category.category === 'Battery')
    ?.specifications.find((spec) => spec.name === 'Charging')?.value

  result.push(`<b>Status:</b> ${statusValue || 'Unknown'}`)
  result.push(
    `<b>Display:</b>\n- ${typeValue || 'Unknown'}\n- ${
      sizeValue || 'Unknown'
    }\n- ${resolutionValue || 'Unknown'}`
  )
  result.push(
    `<b>Platform:</b>\n- ${chipsetValue || 'Unknown'}\n- ${
      gpuValue || 'Unknown'
    }`
  )
  result.push(
    `<b>Main Camera (${mainCameraName || 'Unknown'}):</b>\n- ${
      mainCameraValue || 'Unknown'
    }\n- ${mainCameraFeatures || 'Unknown'}`
  )
  result.push(
    `<b>Selfie Camera (${selfieCameraName || 'Unknown'}):</b>\n- ${
      selfieCameraValue || 'Unknown'
    }`
  )
  result.push(
    `<b>Battery:</b>\n- ${batterySpecs || 'Unknown'}\n- ${
      batteryValue || 'Unknown'
    }`
  )

  const keyboard = new InlineKeyboard()
  keyboard.url('View on GSMArena', `https://gsmarena.com/${device.id}.php`)

  ctx.reply(
    `<b>${deviceName}</b> - <code>${
      codename || 'unknown'
    }</code>\n\n${result.join('\n')}` || 'Unknown',
    {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    }
  )
})

export default composer
