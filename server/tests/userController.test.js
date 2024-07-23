import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import usersRoutes from '../routes/usersRoutes';
import User from '../models/users';
import bcrypt from 'bcryptjs'; 

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/users', usersRoutes);

describe('Users Controller', () => {
  it('should create a user', async () => {
    const res = await request(app)
      .post('/api/users/create')
      .send({
        name: 'testuser',
        email: 'testuser@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('name', 'testuser');
    expect(res.body.user).toHaveProperty('email', 'testuser@example.com');
    expect(res.body).toHaveProperty('token');
  });

  it('should login a user', async () => {
    await new User({
      name: 'testuser',
      email: 'testuser@example.com',
      password: await bcrypt.hash('password123', 10),
      provider: 'native',
      public: 'public',
      introduce: "Let's climb!",
      image: 'https://rockreach-0618.s3.ap-southeast-2.amazonaws.com/account2.png'
    }).save();

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', '登入成功');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'testuser@example.com');
    expect(res.body).toHaveProperty('token');
  });

  it('should get a user by id', async () => {
    const user = await new User({
      name: 'anotheruser',
      email: 'anotheruser@example.com',
      password: await bcrypt.hash('password123', 10),
      provider: 'native',
      public: 'public',
      introduce: "Let's climb!",
      image: 'https://rockreach-0618.s3.ap-southeast-2.amazonaws.com/account2.png'
    }).save();

    const res = await request(app)
      .get(`/api/users/${user._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'anotheruser');
    expect(res.body).toHaveProperty('introduce', "Let's climb!");
  });

  it('should return 409 if email exists', async () => {
    await new User({
      name: 'testuser',
      email: 'testuser@example.com',
      password: await bcrypt.hash('password123', 10),
      provider: 'native',
      public: 'public',
      introduce: "Let's climb!",
      image: 'https://rockreach-0618.s3.ap-southeast-2.amazonaws.com/account2.png'
    }).save();

    const res = await request(app)
      .get('/api/users/check-email/testuser@example.com');
    expect(res.statusCode).toEqual(409);
    expect(res.body).toHaveProperty('exists', true);
  });

  it('should return 409 if name exists', async () => {
    await new User({
      name: 'testuser',
      email: 'testuser@example.com',
      password: await bcrypt.hash('password123', 10),
      provider: 'native',
      public: 'public',
      introduce: "Let's climb!",
      image: 'https://rockreach-0618.s3.ap-southeast-2.amazonaws.com/account2.png'
    }).save();

    const res = await request(app)
      .get('/api/users/check-name/testuser');
    expect(res.statusCode).toEqual(409);
    expect(res.body).toHaveProperty('exists', true);
  });

  it('should return 200 if email does not exist', async () => {
    const res = await request(app)
      .get('/api/users/check-email/nonexistent@example.com');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('exists', false);
  });

  it('should return 200 if name does not exist', async () => {
    const res = await request(app)
      .get('/api/users/check-name/nonexistentname');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('exists', false);
  });
});
