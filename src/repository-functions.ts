import * as fs from 'fs';
import { Clone as nodegitClone, Repository } from 'nodegit';
import * as rm from 'rimraf';
import { config } from './config';
import * as Octokit from '@octokit/rest';

const twirlTimer = () => {
  const P = ['\\', '|', '/', '-'];
  let x = 0;
  return setInterval(() => {
    process.stdout.write(`\r[ ${P[x++]} ] => awaiting clone ${config.blogRepoUrl} ....`);
    // tslint:disable-next-line:no-bitwise
    x &= 3;
  }, 50);
};
export const blogDirExists = fs.existsSync(config.blogDirectory);

export const getFirstCommit = async (): Promise<string> => {
  // const github = new Github({ token: 'c6ab6a59fd0fa2814ab632e2d927c83b7993f0e3' });
  const gh = new Octokit();
  gh.authenticate({
    type: 'token',
    token: 'c6ab6a59fd0fa2814ab632e2d927c83b7993f0e3',
  });
  const response = await gh.repos.getCommits({
    repo: 'amagno-gatsby-blog',
    owner: 'amagno',
  });
  const firstShaCommit = response.data[0].sha;
  if (typeof firstShaCommit !== 'string') {
    throw new Error('repository is not valid');
  }
  return firstShaCommit;
};
export const openBlogRepo = async () => {
  return await Repository.open(config.blogDirectory);
};

// export const cloneBlogRepo =  () => {
//   const loading = twirlTimer();
//   const repo = Clone.clone(config.blogRepoUrl, config.blogDirectory)
//     .then(async (r) => {
//       // process.stdout.write('\r' + 'OK');
//       clearInterval(loading);
//       console.log('\n[ * ] => Done !');
//       const commit = await r.getHeadCommit();
//       console.log('[ * ] => Latest Commit sha: ' + commit.sha());
//       return r;
//     })
//     .catch((e) => {
//       // process.stdout.write('\r' + 'ERROR');
//       clearInterval(loading);
//       throw new Error(e);
//     });
//   return repo;
// };
export const removeBlogDir = () => {
  rm.sync(config.blogDirectory);
};

export const cloneGithubRepository = async (url: string, name: string) => {
  const fullPath = `${config.repositoriesDirectory}/${name}`;
  const exists = await fs.existsSync(fullPath);
  if (exists) {
    await rm.sync(fullPath);
  }
  return nodegitClone.clone(url, fullPath);
};
