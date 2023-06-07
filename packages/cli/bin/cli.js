#!/usr/bin/env node

import importLocal from'import-local'
import entry from'../lib/index.js'
import {log} from'@liwei.com/utils'
// import {fileUrlToPath} from 'node:url'
import {filename} from "dirname-filename-esm";

// const __filename = fileUrlToPath(import.meta.url)
const __filename = filename(import.meta)

if (importLocal(__filename)) {
    log.info('cli','使用本次 cli-lw 版本')
} else {
    entry(process.argv.slice(2))
}
