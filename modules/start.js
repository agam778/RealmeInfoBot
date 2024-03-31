import { Composer } from 'grammy'
import { logCommand } from '../helpers.js'
const composer = new Composer()

composer.command(
  'start',
  (ctx) =>
    logCommand(ctx) &&
    ctx.reply(
      'Hello! I am RealmeInfoBot, and I can provide you information about Realme devices.\n\n' +
        'Run the /help command to see the list of commands!'
    )
)

export default composer
