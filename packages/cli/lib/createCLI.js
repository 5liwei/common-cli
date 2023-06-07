import path from 'node:path';
import { program } from 'commander';
import { dirname } from 'dirname-filename-esm';
import fse from 'fs-extra';
import { log } from '@liwei.com/utils';
import semver from 'semver';
import chalk from 'chalk';

const __dirname = dirname(import.meta);
const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = fse.readJsonSync(pkgPath);

const LOWEST_NODE_VERSION = '15.0.0';

function checkNodeVersion() {
    log.verbose('node version', process.version);
    if (!semver.gte(process.version, LOWEST_NODE_VERSION)) {
        throw new Error(chalk.red(`cli-liwei 需要安装 ${LOWEST_NODE_VERSION} 以上版本的 Node.js`));
    }
}

function preAction() {
    // 检查Node版本
    checkNodeVersion();
}

export default function createCLI() {
    log.info('version', pkg.version);
    program
        .name(Object.keys(pkg.bin)[0])
        .usage('<command> [options]')
        .version(pkg.version)
        .option('-d, --debug', '是否开启调试模式', false)
        .hook('preAction', preAction);

    program.on('option:debug', function() {
        console.log(program.opts());
        if (program.opts().debug) {
            log.verbose('debug', 'launch debug mode');
        }
    });

    program.on('command:*', function(obj) {
        log.error('未知的命令：' + obj[0]);
    });
    return program;
}
