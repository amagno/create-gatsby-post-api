import { cloneGithubRepository } from './repository-functions';
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
import axios from 'axios';
import * as rm from 'rimraf';
import * as jwt from 'jsonwebtoken';
import * as jwtMiddleware from 'express-jwt';
import * as http from 'http';
import * as socket from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = socket(server);

const clientId = '37b7f18f970f2b8bb52e';
const clientSecret = 'd7e8184f691a7e99d8b7598742b7186377e5b0f2';
const tokeSecret = 'ajkdhaskjdhaskjdhkasjhdk';

interface ICreatePostInput {
  title: string;
  content: string;
}
interface IInitRepoInput {
  name: string;
  git_url: string;
  token: string;
  owner: string;
}

const postValidation = joi.object().keys({
  title: joi.string().alphanum().min(3).required(),
  content: joi.string().min(3).required(),
});

const initRepoValidation = joi.object().keys({
  name: joi.string().min(3).required(),
  git_url: joi.string().min(3).required(),
  token: joi.string().required(),
  owner: joi.string().required()
});

// MIDDLEWARES
const validationMiddleware = (joiSchema: joi.ObjectSchema) => (req, res, next) => {
  const validation = joi.validate(req.body, joiSchema);
  if (validation.error !== null) {
    return res.status(400).send(validation.error.details).end();
  }
  next();
};



// INITIALIZE
if (fs.existsSync(config.repositoriesDirectory)) {
  rm.sync(config.repositoriesDirectory);
  io.on('connection', () => {
    io.emit('repositories-removed', { for: 'everyone' });
  });
}

app.use(json());
app.use(raw());
app.use(cors());
app.use(logger('dev'));

app.get('/test', jwtMiddleware({ secret: tokeSecret }), (req, res) => {
  console.log('RETRIEVE SESSION ===> ', req.user);
  res.send(req.user || 'oppppsss');
});

// tslint:disable-next-line:max-line-length
app.post('/post', validationMiddleware(postValidation), jwtMiddleware({ secret: tokeSecret }), async (req, res) => {
  const data: ICreatePostInput = req.body;

  try {
    const repoPath = req.user.repoPath;
    if (typeof repoPath !== 'string') {
      return res.status(400).send(`invalid repository path on token ${repoPath}`);
    }
    const result = await createPost(data.title, data.content, repoPath);
    res.send(result);
  } catch (error) {
    res.status(400).send(error).end();
  }
});
// ler todos os posts (arquivos md) dentro da pasta src/pages e retorna lista
app.get('/post', jwtMiddleware({ secret: tokeSecret }), (req, res) => {
  const path = `${req.user.repoPath}src/pages/`;
  const posts = [];

  fs.readdirSync(path).forEach(file => {
    const currentPath = path + file;
    const stat = fs.lstatSync(currentPath);

    if (stat.isDirectory()) {
      let existIndex = false;
      fs.readdirSync(currentPath).forEach(md => {
        if (md === 'index.md') {
          existIndex = true;
        }
      })
      
      if (existIndex) {
        posts.push(file);
      }
    }
  })

  return res.send(posts);
})

app.get('/post/:postName', jwtMiddleware({ secret: tokeSecret }), (req, res) => {
  const postName = req.params.postName;
  if (!postName) {
    return res.status(400).send('please send name of repo').end();
  }

  const path = `${req.user.repoPath}src/pages/${postName}/index.md`;


  if (!fs.existsSync(path)) {
    return res.status(500).send(`the path for post ${path} not exists`).end();
  }

  const file = fs.readFileSync(path);

  return res.status(200).send(file.toString('utf8')).end();
})

app.get('/github-access-token', jwtMiddleware({ secret: tokeSecret }), (req, res) => {
  return res.status(200).send(req.user.github_token).end();
});

// tslint:disable-next-line:max-line-length
app.post('/repository/init', validationMiddleware(initRepoValidation), async (req, res) => {
  const data: IInitRepoInput = req.body;

  try {
    const repoPath = await cloneGithubRepository(data.token, data.owner, data.name, data.git_url);
    // const repoPath = repo.path().slice(0, (repo.path().length - 5));
    console.log('CREATE', data);
    console.log(repoPath);

    const token = jwt.sign({
      repoPath,
      token: data.token,
      name: data.name,
      owner: data.owner
    }, tokeSecret);

    return res.status(200).json({
      token,
      name: data.name,
    }).end();

  } catch (error) {
    return res.status(500).send(error).end();
  }
});

app.get('/oauth/redirect/', async (req, res) => {

  console.log(req.query);
  const requestCode = req.query.code;

  if (typeof requestCode !== 'string') {
    return res.status(400).send('request code is invalid').end();
  }

  if (requestCode.length < 3) {
    return res.status(400).send('request code is invalid').end();
  }
  const url = 'https://github.com/login/oauth/access_token';

  const response = await axios.post(url, {
    client_id: clientId,
    client_secret: clientSecret,
    code: requestCode,
  });

  // const match = response.data.match(/\access_token=(.*)/);
  // const accessToken =  !!match ? !!match[1] ? match[1].split('&')[0] : undefined : undefined;
  const accessToken =  response.data;
  console.log('ACESSS', accessToken);
  if (!accessToken) {
    return res.status(400).send('error on github response access_token').end();
  }

  // const token = jwt.sign({
  //   github_token: accessToken,
  // }, tokeSecret);

  return res.redirect(`http://localhost:3000?${accessToken}`);

});

// io.on('connection', () => {
//   console.log('client connected');
// });

// LISTEN
server.listen(config.port, () => {
  console.log(`[ * ] => App is running http://localhost:${config.port}`);
});
