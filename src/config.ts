import * as path from 'path';

export interface IConfig {
  // blogDirectory: string;
  blogRepoUrl: string;
  port: number;
  repositoriesDirectory: string;
}
export const config: IConfig = {
  // blogDirectory: './',
  repositoriesDirectory: './repositories',
  // blogDirectory: path.resolve(__dirname, '../blog/src/pages/'),
  blogRepoUrl: 'https://github.com/amagno/amagno-gatsby-blog.git',
  port: 4000,
};
