import { execSync } from 'child_process';
import { config } from './config';

export const runCommandTest = () => {
  const command  = execSync(`cd ${config.blogDirectory} && npm run build`);

  console.log(command.toString('utf8'));
};
