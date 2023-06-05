const { Bot, GrammyError, HttpError } = require('grammy')
const { autoQuote } = require('@roziscoding/grammy-autoquote')
const fs = require('fs')
const path = require('path')

if (fs.existsSync('.env')) {
  require('dotenv').config()
}

const logchannel = process.env.LOG_CHANNEL
if (!logchannel) {
  throw new Error('LOG_CHANNEL not set in environment variables! Exiting...')
}

const botToken = process.env.BOT_TOKEN
if (!botToken) {
  throw new Error('BOT_TOKEN not set in environment variables! Exiting...')
}

async function logCommand(ctx) {
  if (process.env.LOG_COMMANDS === 'true') {
    const commandText = ctx.message.text
    const chatTitle = ctx.chat.title
    const userFirstName = ctx.from.first_name
    const userLastName = ctx.from.last_name || ''
    const username = ctx.from.username || ''

    const logMessage = `Command: <code>${commandText}</code>\n\nGroup: <code>${chatTitle}</code>\n\nUser: ${userFirstName} ${userLastName} (@${username})`

    ctx.api.sendMessage(logchannel, logMessage, {
      parse_mode: 'HTML',
      chat_id: logchannel,
    })
  }
}

async function start() {
  const bot = new Bot(botToken)
  bot.use(autoQuote)

  const commandFilesDir = path.resolve(__dirname, 'commands')
  const commandFiles = fs
    .readdirSync(commandFilesDir)
    .filter((file) => file.endsWith('.js'))
  for (const file of commandFiles) {
    const command = require(path.join(commandFilesDir, file))
    bot.command(command.name, (ctx) => {
      logCommand(ctx)
      command.handler(ctx)
    })
    if (command.alias) {
      for (const alias of command.alias) {
        bot.command(alias, (ctx) => {
          logCommand(ctx)
          command.handler(ctx)
        })
      }
    }
  }

  bot.command('start', (ctx) =>
    ctx.reply(
      'Hello! I am RealmeInfoBot, and I can tell you the name of the model if you provide me the codename, vice versa.\n\n' +
        'Run the /help command to see the list of commands!'
    )
  )

  bot.catch((err) => {
    const ctx = err.ctx
    console.log(`Error while handling update ${ctx.update.update_id}:`)
    const e = err.error
    const commandText = ctx.message.text
    const chatTitle = ctx.chat.title
    const errorMessage = `Command: <code>${commandText}</code>\n\nUser: ${ctx.from.first_name} ${ctx.from.last_name} (${ctx.from.username})\n\nGroup: <code>${chatTitle}</code>\n\nError: <code>${e}</code>`

    if (e instanceof GrammyError) {
      ctx.api.sendMessage(logchannel, `Error in request:\n\n${errorMessage}`, {
        parse_mode: 'HTML',
        chat_id: logchannel,
      })
      ctx.reply('Error in request:', e.description)
    } else if (e instanceof HttpError) {
      ctx.api.sendMessage(
        logchannel,
        `Could not contact Telegram:\n\n${errorMessage}`,
        { parse_mode: 'HTML', chat_id: logchannel }
      )
      ctx.reply('Could not contact Telegram:', e)
    } else {
      ctx.reply(`Oops, an error occurred!\n\n${errorMessage}`, {
        parse_mode: 'HTML',
        chat_id: logchannel,
      })
      ctx.reply('Oops, an error occurred!\n\n' + e)
    }
  })

  process.on('uncaughtException', (err) => {
    console.error(err)
  })

  process.on('unhandledRejection', (err) => {
    console.error(err)
  })

  process.on('SIGINT', () => {
    console.log('Stopping @RealmeInfoBot...')
    bot.stop()
    process.exit(0)
  })

  require('./webserver.js')

  console.log('Starting @RealmeInfoBot...')
  await bot.start()
}

start().catch((error) => {
  console.error('Error occurred during bot startup:', error)
  process.exit(1)
})
