const axios = require("axios");
const { InlineKeyboard } = require("grammy");
const gsmarena = require("gsmarena-api");

module.exports = {
  name: "deviceinfo",
  description: "Get the details of the mentioned device",
  handler: async (ctx) => {
    const { message } = ctx;
    const { text } = message;

    const name = text.substring(text.indexOf(" ") + 1);

    if (!name) {
      ctx.reply("Please provide the name of the device!");
      return;
    }

    const device = await gsmarena.search.search(name);

    if (device.length === 0) {
      ctx.reply(`The device <code>${name}</code> does not exist!`, {
        parse_mode: "HTML",
      });
      return;
    }

    const details = await gsmarena.catalog.getDevice(device[0].id);
    const { name: deviceName, img: deviceImage, quickSpec } = details;

    const result = [];

    for (const spec of quickSpec) {
      const { name, value } = spec;
      result.push(`<b>${name}</b>: ${value}`);
    }

    const keyboard = new InlineKeyboard();
    keyboard.url(
      "View on GSMArena",
      `https://gsmarena.com/${device[0].id}.php`
    );

    ctx.replyWithPhoto(deviceImage, {
      caption: `<b>${deviceName}</b>\n\n${result.join("\n")}`,
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
  },
};
