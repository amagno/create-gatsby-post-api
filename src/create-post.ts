import * as fs from 'fs';
import { capitalize } from 'lodash';

interface ITemplateOptions {
  title: string;
  content: string;
  path?: string;
  tags?: string[];
}

const template = (options: ITemplateOptions): string => `---
path: "${options.path || '/' + options.title.toLowerCase()}"
date: "${new Date().toISOString()}"
title: "${capitalize(options.title.toLowerCase())}"
tags: [${(options.tags || []).toString()}]
---
${options.content}
`;

// tslint:disable-next-line:max-line-length
export const createPost = (title: string, content: string, repoPath: string) => new Promise<string>((resolve, reject) => {
  const postContent = template({
    title,
    content,
  });
  console.log(title, content);
  const sanitizedTitle = title.replace(/\W/g, '').replace(' ', '-');
  const fullPath = `${repoPath}src/pages/${sanitizedTitle}`;

  console.log('creating ====>', fullPath);
  if (fs.existsSync(fullPath)) {
    return reject(`Post: ${fullPath} already exists!`);
  }

  try {
    fs.mkdirSync(fullPath);
    fs.writeFileSync(`${fullPath}/index.md`, postContent);
    return resolve(`Post: ${fullPath} success created!`);
  } catch (error) {
    return reject(`Post: error on create ${fullPath} ${error}`);
  }

});
