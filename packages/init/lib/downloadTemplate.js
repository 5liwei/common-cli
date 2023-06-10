import path from 'node:path';
import { pathExistsSync } from 'path-exists';
import fse from 'fs-extra';
import ora from 'ora';
import { execa } from 'execa';
import { printErrorLog, log } from '@liwei.com/utils';

function getCacheDir(targetPath) {
  return path.resolve(targetPath, 'node_modules');
}

function makeCacheDir(targetPath) {
  const cacheDir = getCacheDir(targetPath);
  if (!pathExistsSync(cacheDir)) {
    fse.mkdirpSync(cacheDir);
  }
}

async function downloadAddTemplate(targetPath, selectedTemplate) {
  const { npmName, version } = selectedTemplate;
  const installCommand = 'npm';
  const installArgs = ['install', `${npmName}@${version}`];
  const cwd = targetPath;
  log.verbose('installArgs', installArgs);
  log.verbose('cwd', cwd);
  await execa(installCommand, installArgs, { cwd });
}

export default async function downloadTemplate(selectedTemplate) {
  const { targetPath, template } = selectedTemplate;
  makeCacheDir(targetPath);
  const spinner = ora('正在下载模板...').start();
  try {
    await downloadAddTemplate(targetPath, template);
    spinner.stop();
    log.success('下载模板成功');
  } catch (e) {
    spinner.stop();
    printErrorLog(e);
  }
}
