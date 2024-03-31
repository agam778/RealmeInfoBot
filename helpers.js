export async function logCommand(ctx) {
  if (process.env.LOG_COMMANDS === 'true') {
    const commandText = ctx.message.text
    const userFirstName = ctx.from.first_name
    const userLastName = ctx.from.last_name || ''
    const username = ctx.from.username || ''
    const logchannel = process.env.LOG_CHANNEL
    const logMessage = `Command: <code>${commandText}</code>\n\nUser: ${userFirstName} ${userLastName} (@${username})`

    ctx.api.sendMessage(logchannel, logMessage, {
      parse_mode: 'HTML',
      chat_id: logchannel,
    })
  }
}
