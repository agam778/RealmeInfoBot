# RealmeInfoBot

RealmeInfoBot is a Telegram bot that provides device information for Realme smartphones. It can retrieve details such as device specifications, codenames, and more.

## Commands

The following commands are available:

### `/deviceinfo <device-name>`
- Description: Get the details of the mentioned device.
- Example: `/deviceinfo Realme X2 Pro`

### `/codename <device-name>`
- Description: Get the device's codename from the name.
- Example: `/codename Realme 5 Pro`

### `/ota <region_code> | <codename> | <ota_version> | <realmeui_version>`
- Description: Request and send OTA packages from BBK server(s)
- Example: ` /ota 2 | RMX2020 | RMX2020_11.C.12 | 2`

### `/whatis <codename>`
- Description: Get the device's name from the codename.
- Example: `/whatis RMX1971`

### `/help`
- Description: Get the list of available commands.
- Example: `/help`

# Add it to your group
To add this bot in your group, invite "[@RealmeInfoBot](https://t.me/RealmeInfoBot)" to your group

# Contributing
To add missing devices/codenames, please visit https://github.com/agam778/realmebot-api#contributing

# Other Information

## About the environment variables:

The environment variables are present in `.env.example`, rename it to `.env` and fill in the values if you're self hosting it.

- BOT_TOKEN: The token of your bot, get it from @BotFather
- LOG_CHANNEL: The ID of the channel/group where the logs will be sent if an error occurs when a command is executed
- LOG_COMMANDS: Set it to `true` if you want to log the commands executed by the users [OPTIONAL]

## Self host:

- Clone the repository
- Update the `.env.example` file as per the guide above.
- Rename the file by removing the `.example` extension.
- Install Dependencies: Run `yarn install`
- Run the Bot: Run `yarn start`

# Credits:
- [R0rt1z2](https://github.com/R0rt1z2) for ota command

# License

RealmeInfoBot is licensed under the GPL 3.0 license. See the [`LICENSE`](./LICENSE) file for more information.
If you are using the customized version of this bot/using any command in the bot for your own purposes, I would be grateful to have credits in any form.