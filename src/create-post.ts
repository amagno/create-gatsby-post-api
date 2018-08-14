import * as fs from 'fs';
import { capitalize } from 'lodash';
import { config } from './config';
const template = (options: {
  title: string,
  content: string,
  path?: string,
  tags?: string[],
}): string => `---
path: "${options.path || '/' + options.title.toLowerCase()}"
date: "${new Date().toISOString()}"
title: "${capitalize(options.title.toLowerCase())}"
tags: [${(options.tags || []).toString()}]
---
${options.content}
`;
export const createPost = (title: string, content: string) => new Promise<string>((resolve, reject) => {
  const postContent = template({
    title,
    content,
  });
  const postDirectory = `${config.blogDirectory}/src/pages/${title.replace(' ', '-')}`;
  if (!fs.existsSync(postDirectory)) {
    fs.mkdirSync(postDirectory);
    fs.writeFileSync(`${postDirectory}/index.md`, postContent);
    return resolve(`Post: ${postDirectory} success created!`);
  }
  return reject(`Post: ${postDirectory} already exists!`);
});
