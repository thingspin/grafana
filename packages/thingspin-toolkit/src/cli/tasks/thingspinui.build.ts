// 3rd party libs
import fs from 'fs';
import execa from 'execa';
import chalk from 'chalk';

// grafana libs
import { useSpinner } from '../../../../grafana-toolkit/src/cli/utils/useSpinner';
import { Task, TaskRunner } from '../../../../grafana-toolkit/src/cli/tasks/task';
import { savePackage, clean } from '../../../../grafana-toolkit/src/cli/tasks/grafanaui.build';
import { changeCwdToGrafanaUi, restoreCwd } from '../../../../grafana-toolkit/src/cli/utils/cwd';

let distDir: string, cwd: string;

// @ts-ignore
const compile = useSpinner<void>('Compiling sources', () => execa('tsc', ['-p', './tsconfig.build.json']));

// @ts-ignore
const rollup = useSpinner<void>('Bundling', () => execa('npm', ['run', 'build:fms']));

const preparePackage = async (pkg: any) => {
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

export const buildTask = new Task<void>('@thingspin/ui build', buildTaskRunner);
