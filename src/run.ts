import * as fs from 'fs';
import { config } from './config';
import { blogDirExists, openBlogRepo, getFirstCommit, cloneBlogRepo, removeBlogDir } from './repository-functions';
import { Repository } from 'nodegit';

export const run = async (): Promise<Repository> => {
  if (!blogDirExists) {
    return await cloneBlogRepo();
  }
  try {
    const repo = await openBlogRepo();
    const localCommit = await repo.getHeadCommit();
    const localFirstCommit = localCommit.sha();
    const remoteFirstCommit = await getFirstCommit();

    if (localFirstCommit !== remoteFirstCommit) {
      removeBlogDir();
      return await cloneBlogRepo();
    }
    console.log(`[ * ] => Your blog is already updated sha: ${remoteFirstCommit}`);
    return repo;
  } catch (e) {
    console.log(e.message);
    removeBlogDir();
    return await cloneBlogRepo();
  }
};
