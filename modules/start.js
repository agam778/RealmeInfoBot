import { Composer } from 'grammy'
const composer = new Composer()

composer.command('start', (ctx) =>
  ctx.reply(
    'Hello! I am RealmeInfoBot, and I can provide you information about Realme devices.\n\n' +
      'Run the /help command to see the list of commands!'
  )
)

export default composer
