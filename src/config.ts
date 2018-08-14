import * as path from 'path';

export interface IConfig {
  blogDirectory: string;
  blogRepoUrl: string;
  port: number;
}
export const config: IConfig = {
  blogDirectory: path.resolve(__dirname, '../blog'),
  blogRepoUrl: 'https://github.com/amagno/amagno-gatsby-blog.git',
  port: 3000,
};
