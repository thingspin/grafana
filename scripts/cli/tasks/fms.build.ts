import execa from 'execa';
import fs from 'fs';
import { changeCwdToGrafanaUi, restoreCwd } from '../utils/cwd';
import chalk from 'chalk';
import { useSpinner } from '../utils/useSpinner';
import { Task, TaskRunner } from './task';

import { savePackage } from './grafanaui.build';

let distDir, cwd;

const clean = useSpinner<void>('Cleaning', async () => await execa('npm', ['run', 'clean']));

const compile = useSpinner<void>('Compiling sources', () => execa('tsc', ['-p', './tsconfig.build.json']));

const rollup = useSpinner<void>('Bundling', () => execa('npm', ['run', 'build:fms']));

const preparePackage = async pkg => {
  pkg.main = 'index.js';
  pkg.types = 'index.d.ts';
  await savePackage({
    path: `${cwd}/dist/package.json`,
    pkg,
  });
};

const moveFiles = () => {
  const files = ['README.md', 'CHANGELOG.md', 'index.js'];
  return useSpinner<void>(`Moving ${files.join(', ')} files`, async () => {
    const promises = files.map(file => {
      return new Promise((resolve, reject) => {
        fs.copyFile(`${cwd}/${file}`, `${distDir}/${file}`, err => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });

    await Promise.all(promises);
  })();
};

const buildTaskRunner: TaskRunner<void> = async () => {
  cwd = changeCwdToGrafanaUi();
  distDir = `${cwd}/dist`;
  const pkg = require(`${cwd}/package.json`);
  console.log(chalk.yellow(`Building ${pkg.name} (package.json version: ${pkg.version})`));

  await clean();
  await compile();
  await rollup();
  await preparePackage(pkg);
  await moveFiles();

  restoreCwd();
};

const buildTask = new Task<void>();
buildTask.setName('@thingspin/ui build');
buildTask.setRunner(buildTaskRunner);

export { buildTask, savePackage };
