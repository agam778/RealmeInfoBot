const fs = require('fs')

module.exports = {
  name: 'help',
  description: 'Show a list of commands',
  handler: async (ctx) => {
    const commandFiles = fs
      .readdirSync(__dirname)
      .filter((file) => file.endsWith('.js'))

    const commands = commandFiles.map((file) => require(`./${file}`))

    let output = "Here's the list of commands you can use:\n\n"

    for (const command of commands) {
      output += `/${command.name}`
      if (command.alias) {
        output += `, /${command.alias.join(', /')}`
      }
      output += ` - ${command.description}\n`
    }

    await ctx.reply(output, { parse_mode: 'HTML' })
  },
}
