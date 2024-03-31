import { Bot, GrammyError, HttpError } from 'grammy'
import { autoQuote } from '@roziscoding/grammy-autoquote'
import { config } from 'dotenv'
import fs from 'fs'
import './webserver.js'
import composer from './modules/mod.js'

if (fs.existsSync('.env')) {
  config()
}

const logchannel = process.env.LOG_CHANNEL
if (!logchannel) {
  throw new Error('LOG_CHANNEL not set in environment variables! Exiting...')
}

const botToken = process.env.BOT_TOKEN
if (!botToken) {
  throw new Error('BOT_TOKEN not set in environment variables! Exiting...')
}

async function start() {
  const bot = new Bot(botToken)
  bot.use(autoQuote())
  bot.use(composer)

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

  console.log('Starting @RealmeInfoBot...')
  await bot.start()
}

start().catch((error) => {
  console.error('Error occurred during bot startup:', error)
  process.exit(1)
})
