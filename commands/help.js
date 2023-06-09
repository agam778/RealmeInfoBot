const fs = require('fs')

module.exports = {
  name: 'help',
  description: 'Show a list of commands',
  usage: '/help OR /help <command>',
  example: `/help OR /help deviceinfo`,
  handler: async (ctx) => {
    const { message } = ctx
    const { text } = message

    if (text === '/help' || text === `/help@${ctx.me.username}`) {
      const commandFiles = fs
        .readdirSync(__dirname)
        .filter((file) => file.endsWith('.js'))

      const commands = commandFiles.map((file) => require(`./${file}`))

      let output = "Here's the list of commands you can use:\n\n"

      for (const command of commands) {
        output += `/${command.name}`
        if (command.alias && Array.isArray(command.alias)) {
          output += `, /${command.alias.join(', /')}`
        }
        output += ` - ${command.description}\n`
      }

      await ctx.reply(output, { parse_mode: 'HTML' })
    } else if (text.substring(text.indexOf(' ') + 1)) {
      const command = text.substring(text.indexOf(' ') + 1)
      const commandFiles = fs
        .readdirSync(__dirname)
        .filter((file) => file.endsWith('.js'))

      const commands = commandFiles.map((file) => require(`./${file}`))

      const commandDetail = commands.find(
        (cmd) =>
          cmd.name === command || (cmd.alias && cmd.alias.includes(command))
      )

      if (commandDetail) {
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
  },
}
