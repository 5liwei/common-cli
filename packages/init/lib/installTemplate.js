import path from 'node:path';
import fse from 'fs-extra';
import { pathExistsSync } from 'path-exists';
import ora from 'ora';
import ejs from 'ejs';
import glob from 'glob';
import { log, makeList, makeInput } from '@liwei.com/utils';
import { pathToFileURL } from 'url';

function getCacheFilePath(targetPath, template) {
  return path.resolve(targetPath, 'node_modules', template.npmName, 'template');
}

function getPluginFilePath(targetPath, template) {
  return path.resolve(targetPath, 'node_modules', template.npmName, 'plugins', 'index.js');
}

function copyFile(targetPath, template, installDir) {
  const originFile = getCacheFilePath(targetPath, template);
  const fileList = fse.readdirSync(originFile);
  const spinner = ora('正在拷贝模板文件...').start();
  fileList.map(file => {
    fse.copySync(`${originFile}/${file}`, `${installDir}/${file}`);
  });
  spinner.stop();
  log.success('模板拷贝成功');
}

async function ejsRender(targetPath, installDir, template, name) {
  log.verbose('ejsRender', installDir, template);
  const { ignore } = template;
  // 执行插件
  let data = {};
  const pluginPath = getPluginFilePath(targetPath, template);
  if (pathExistsSync(pluginPath)) {
    const pluginURL = pathToFileURL(pluginPath);
    const pluginFn = (await import(pluginURL)).default;
    // const pluginFn = (await import(pluginPath)).default;
    const api = {
      makeList,
      makeInput,
    }
    data = await pluginFn(api);
  }
  const ejsData = {
    data: {
      name, // 项目名称
      ...data,
    }
  }
  const ignorePatterns = [
    ...ignore,
    '**/node_modules/**',
  ];
  log.verbose('Ignore patterns', ignorePatterns);
  glob('**', {
    cwd: installDir,
    nodir: true,
    ignore: ignorePatterns,
  }, (err, files) => {

    files.forEach(file => {
      const filePath = path.join(installDir, file);
      log.verbose('filePath', filePath);
      ejs.renderFile(filePath, ejsData, (err, result) => {
        if (!err) {
          fse.writeFileSync(filePath, result);
        } else {
          log.error(err);
        }
      });
    });
  });
}

export default async function installTemplate(selectedTemplate, opts) {
  const { force = false } = opts;
  const { targetPath, name, template } = selectedTemplate;
  const rootDir = process.cwd();
  fse.ensureDirSync(targetPath);
  const installDir = path.resolve(`${rootDir}/${name}`);
  if (pathExistsSync(installDir)) {
    if (!force) {
      log.error(`当前目录下已存在 ${installDir} 文件夹`);
      return;
    } else {
      fse.removeSync(installDir);
      fse.ensureDirSync(installDir);
    }
  } else {
    fse.ensureDirSync(installDir);
  }
  copyFile(targetPath, template, installDir);
  await ejsRender(targetPath, installDir, template, name);
}
