import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { config } from './config';
import { createPost } from './create-post';
import { runCommandTest } from './commands';
import { run } from './run';
import { json, raw } from 'body-parser';
import * as cors from 'cors';
import * as logger from 'morgan';
import * as joi from 'joi';
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
// run().then((r) => {
//   const app = express();
//   app.use(json());
//   app.post('/post/create', async (req, res) => {
//     const post = req.body as ICreatePostInput;
//     if (!post.title || !post.content) {
//       return res.status(400).json('error plz send all params');
//     }
//     const msg = await createPost(post.title, post.content);
//     console.log(`[ * ] => ${msg}`);
//     return res.json(msg);
//   });
//   app.listen(config.port, () => {
//     console.log(`[ * ] => App is running http://localhost:${config.port}`);
//   });

// });
const postValidation = joi.object().keys({
  title: joi.string().alphanum().min(3).required(),
  content: joi.string().min(3).required(),
});
const validationMiddleware = (joiSchema: joi.ObjectSchema) => (req, res, next) => {
  const validation = joi.validate(req.body, postValidation);
  if (validation.error !== null) {
    return res.status(400).send(validation.error.details).end();
  }
  next();
};
const app = express();
app.use(json());
app.use(raw());
app.use(cors());
app.use(logger('dev'));

app.post('/post/create', validationMiddleware(postValidation), async (req, res) => {
  const data: ICreatePostInput = req.body;

  try {
    const result = await createPost(data.title, data.content);
    res.send(result);
  } catch (error) {
    res.status(400).send(error).end();
  }
});

app.listen(config.port, () => {
  console.log(`[ * ] => App is running http://localhost:${config.port}`);
});
