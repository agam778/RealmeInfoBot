import { Composer } from 'grammy'
import { logCommand } from '../helpers.js'
const composer = new Composer()

const commands = [
  {
    name: 'codename',
    description: "Get device's codename from the name",
    usage: '/codename <device-name>',
    example: `/codename Realme 5 Pro`,
  },
  {
    name: 'deviceinfo',
    description: 'Get the details of the mentioned device',
    usage: '/deviceinfo <device-name>',
    example: `/deviceinfo Realme X2 Pro`,
  },
  {
    name: 'help',
    description: 'Show a list of commands',
    usage: '/help OR /help <command>',
    example: `/help OR /help deviceinfo`,
  },
  {
    name: 'ota',
    description: 'Request and send OTA packages from BBK server(s)',
    usage:
      '/ota <region_code> | <codename> | <ota_version> | <realmeui_version>',
    example: `/ota 2 | RMX2020 | RMX2020_11.C.12 | 2`,
  },
  {
    name: 'start',
    description: 'Start the bot',
    usage: '/start',
    example: `/start`,
  },
  {
    name: 'whatis',
    description: "Get device's name from the codename",
    usage: '/whatis <device-codename>',
    example: `/whatis RMX1971`,
  },
]

composer.command('help', async (ctx) => {
  const { message } = ctx
  const { text } = message
  logCommand(ctx)

  if (text === '/help' || text === `/help@${ctx.me.username}`) {
    let output = "Here's the list of commands you can use:\n\n"

    commands.forEach((command) => {
      output += `/${command.name} - ${command.description}\n`
    })

    await ctx.reply(output, { parse_mode: 'HTML' })
  } else if (text.substring(text.indexOf(' ') + 1)) {
    const command = text.substring(text.indexOf(' ') + 1)

    if (commands.find((cmd) => cmd.name === command)) {
      const commandDetail = commands.find((cmd) => cmd.name === command)
      let output = `*Command:* /${commandDetail.name}\n`
      output += `*Description:* ${commandDetail.description}\n`
      output += `*Usage:* \`${commandDetail.usage}\`\n`
      output += `*Example:* \`${commandDetail.example}\`\n`

      await ctx.reply(output, { parse_mode: 'MarkdownV2' })
    } else {
      await ctx.reply(
        `Command <code>${command}</code> not found!\nRun /help to see all the commands.`,
        {
          parse_mode: 'HTML',
        }
      )
    }
  }
})

export default composer
