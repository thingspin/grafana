// 3rd party libs
//@ts-ignore
import concurrently from 'concurrently';

// grafana libs
import { Task, TaskRunner } from '@grafana/toolkit/src/cli/tasks/task';

export interface StartTaskOptions {
  watchThemes: boolean;
  noTsCheck: boolean;
  hot: boolean;
}

export const startTaskRunner: TaskRunner<StartTaskOptions> = async ({ watchThemes, noTsCheck, hot }) => {
  const noTsCheckArg = noTsCheck ? 1 : 0;
  const jobs = [
    watchThemes && {
      command: 'nodemon -e ts -w ./packages/grafana-ui/src/themes -x yarn run themes:generate',
      name: 'SASS variables generator',
    },

    hot ? {
      command: 'webpack-dev-server --progress --colors --host 0.0.0.0 --config scripts/webpack/fms/webpack.hot.js',
      name: 'Dev server',
    } : {
      command: `webpack --progress --colors --watch --env.noTsCheck=${noTsCheckArg} --config scripts/webpack/fms/webpack.dev.js`,
      name: 'Webpack',
    },
  ];

  try {
    await concurrently(jobs.filter(job => !!job), {
      killOthers: ['failure', 'failure'],
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

export const startTask = new Task<StartTaskOptions>('ThingSPIN Core startTask', startTaskRunner);
