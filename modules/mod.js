import codename from './codename.js'
import deviceinfo from './deviceinfo.js'
import start from './start.js'
import whatis from './whatis.js'
import ota from './ota.js'
import help from './help.js'

import { Composer } from 'grammy'

const composer = new Composer()

composer.use(codename, deviceinfo, start, whatis, ota, help)

export default composer
