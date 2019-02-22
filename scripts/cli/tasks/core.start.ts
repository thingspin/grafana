import concurrently from 'concurrently';
import { Task } from '..';

interface StartTaskOptions {
  watchThemes: boolean;
  hot: boolean;
}

const startTask: Task<StartTaskOptions> = async ({ watchThemes, hot }) => {
  const jobs = [];

  if (watchThemes) {
    jobs.push({
      command: 'nodemon -e ts -w ./packages/grafana-ui/src/themes -x yarn run themes:generate',
      name: 'SASS variables generator',
    });
  }

  if (!hot) {
    jobs.push({
      command: 'webpack --progress --colors --watch --mode development --config scripts/webpack/webpack.dev.js',
      name: 'Webpack',
    });
  } else {
    jobs.push({
      command: 'webpack-dev-server --progress --colors --mode development --config scripts/webpack/webpack.hot.js',
      name: 'Dev server',
    });
  }

  try {
    await concurrently(jobs, {
      killOthers: ['failure', 'failure'],
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

export default startTask;
