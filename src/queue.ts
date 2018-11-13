import * as kue from 'kue';
import * as npm from 'npm';
import { execSync, exec } from 'child_process';
import * as fs from 'fs';
import * as nodePath from 'path';
import { Server, Socket } from 'socket.io';
import * as ghPages from 'gh-pages';
import * as rm from 'rimraf';
import { ClientEmitter, Emitter } from './client-emitter';
export interface IDeployOptions {
  name: string;
  path: string;
  url: string;
  branch: string;
  owner: string;
  githubToken: string;
}

const queue = kue.createQueue();
// "gatsby build --prefix-paths && gh-pages -d public -b master -r \"github.com/amagno/amagno.github.io.git\""
export const deploy = (emitter: Emitter, options: IDeployOptions) => {
  return queue.create('deploy-post', options)
  .on('failed', (message) => {
    console.log('JOB FAILED EMIT MESSAGE');
    emitter.emit('deploy-fail', message);
  })
  .save();
};

const execPromise = (command: string) => new Promise<string>((resolve, reject) => {
  exec(command, (error, sdtout, stderr) => {
    if (!!error) {
      return reject(error);
    }
    resolve(sdtout);
  });
});
queue.process('deploy-post', async (job, done) => {
  try {
    const options = job.data as IDeployOptions;
    const gatsbyBin = nodePath.resolve(`${options.path}/node_modules/.bin/gatsby/`);
    const ghPagesBin = nodePath.resolve('./node_modules/.bin/gh-pages');
    const ghPagesCleanBin = nodePath.resolve('./node_modules/.bin/gh-pages-clean');
    console.log('Starting deploy ====>', options.name);
    job.log(`repo-npm-install started: ${options.path} id: ${job.id}`);
    job.log(`Gatsby binary: ${gatsbyBin}`);
    job.log(`Gh-pages binary: ${ghPagesBin}`);
    if (!fs.existsSync(ghPagesBin)) {
      return done(new Error(`Gh-pages binary not exists: ${ghPagesBin}`));
    }

    try {
      const resultClean = await execPromise(ghPagesCleanBin);
      job.log('Clean success: ' + resultClean);

      const resultInstall = await execPromise(`cd ${options.path} && npm install`);
      job.log('Install success: ' + resultInstall);

      if (!fs.existsSync(gatsbyBin)) {
        return done(new Error(`Gatsby binary not exists: ${gatsbyBin}`));
      }

      const resultBuild = await execPromise(`cd ${options.path} && ${gatsbyBin} build --prefix-paths`);
      job.log('Build success: ' + resultBuild);

      // const cachePath = `${options.path}/.cache/`;
      // if (fs.existsSync(cachePath)) {
      //   job.log(`Remove cache: ${cachePath}`);
      //   rm.sync(cachePath);
      // }
      // tslint:disable-next-line:max-line-length
      // const resultDeploy = await execPromise(`cd ${options.path} && ${ghPagesBin} -d public -b ${options.branch} -r "https://${options.owner}:${options.githubToken}@${options.url}"`);
      job.log('Start publish');
      ghPages.publish(`${options.path}/public`, {
        branch: options.branch,
        repo: `https://${options.owner}:${options.githubToken}@${options.url}`,
      }, (error) => {
        if (!!error) {
          return done(error);
        }
        job.log(`${options.name} deploy success`);
        done();
      });

    } catch (error) {
      done(error);
    }

  } catch (error) {
    done(error);
  }

  // npm.load(() => {
  //   npm.commands.install([job.data.path], (error, result) => {
  //     if (error) {
  //       console.log('error on repo-npm-install');
  //       done(error);
  //     }
  //     // console.log(result);
  //     console.log('finished proccess job: ', job.id);
  //     job.log(result);
  //     done(null, 'finshed process install at: ' + job.data.path);
  //   });
  // });

});
