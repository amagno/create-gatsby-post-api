import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { config } from './config';
import { createPost } from './create-post';
import { runCommandTest } from './commands';
import { run } from './run';
import { json, raw, urlencoded, text } from 'body-parser';
// const app = express();
// removeBlogDir();
// cloneRepo();

// app.get('/', async (req, res) => {
//   createPost('hello world');
//   res.send(repo.path);
// });
// app.listen(3000, () => {
//   console.log('running test');
// });
interface ICreatePostInput {
  title: string;
  content: string;
}
run().then((r) => {
  const app = express();
  app.use(json());
  app.post('/post/create', async (req, res) => {
    const post = req.body as ICreatePostInput;
    if (!post.title || !post.content) {
      return res.status(400).json('error plz send all params');
    }
    const msg = await createPost(post.title, post.content);
    console.log(`[ * ] => ${msg}`);
    return res.json(msg);
  });
  app.listen(config.port, () => {
    console.log(`[ * ] => App is running http://localhost:${config.port}`);
  });

});
