// 3rd party libs
import chalk from 'chalk';
import program from 'commander';

// grafana libs
import { execTask } from '../../../grafana-toolkit/src/cli/utils/execTask';

// thingspin libs
import { startTask } from './tasks/core.start';
import { buildTask } from './tasks/thingspinui.build';
import { releaseTask } from './tasks/thingspinui.release';

export const run = (includeInternalScripts = false) => {
  if (includeInternalScripts) {
    program.option('-d, --depreciate <scripts>', 'Inform about npm script deprecation', v => v.split(','));
    program
      .command('core:start')
      .option('-h, --hot', 'Run front-end with HRM enabled')
      .option('-t, --watchTheme', 'Watch for theme changes and regenerate variables.scss files')
      .description('Starts Grafana front-end in development mode with watch enabled')
      .action(async cmd => {
        await execTask(startTask)({
          watchThemes: cmd.watchTheme,
          hot: cmd.hot,
        });
      });

    program
      .command('gui:build')
      .description('Builds @grafana/ui package to packages/grafana-ui/dist')
      .action(async cmd => {
        // @ts-ignore
        await execTask(buildTask)();
      });

    program
      .command('gui:release')
      .description('Prepares @grafana/ui release (and publishes to npm on demand)')
      .option('-p, --publish', 'Publish @grafana/ui to npm registry')
      .option('-u, --usePackageJsonVersion', 'Use version specified in package.json')
      .option('--createVersionCommit', 'Create and push version commit')
      .action(async cmd => {
        await execTask(releaseTask)({
          publishToNpm: !!cmd.publish,
          usePackageJsonVersion: !!cmd.usePackageJsonVersion,
          createVersionCommit: !!cmd.createVersionCommit,
        });
      });
  }

  program.on('command:*', () => {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
  });

  program.parse(process.argv);

  if (program.depreciate && program.depreciate.length === 2) {
    console.log(
      chalk.yellow.bold(
        `[NPM script depreciation] ${program.depreciate[0]} is deprecated! Use ${program.depreciate[1]} instead!`
      )
    );
  }
};
