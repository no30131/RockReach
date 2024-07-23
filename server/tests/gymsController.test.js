import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import gymsRoutes from '../routes/gymsRoutes';
import Gyms from '../models/gyms';

const app = express();
app.use(bodyParser.json());
app.use('/api/gyms', gymsRoutes);

describe('Gyms Controller', () => {
  it('should create a gym', async () => {
    const res = await request(app)
      .post('/api/gyms/create')
      .send({
        name: 'Gym1',
        phone: '1234567890',
        address: '123 Street, City'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'Gym1');
    expect(res.body).toHaveProperty('phone', '1234567890');
    expect(res.body).toHaveProperty('address', '123 Street, City');
  });

  it('should get all gyms', async () => {
    await Gyms.create([
      { name: 'Gym1', phone: '1234567890', address: '123 Street, City' },
      { name: 'Gym2', phone: '0987654321', address: '456 Avenue, City' }
    ]);

    const res = await request(app).get('/api/gyms/all');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(2);
    expect(res.body[0]).toHaveProperty('name', 'Gym1');
    expect(res.body[0]).toHaveProperty('phone', '1234567890');
    expect(res.body[0]).toHaveProperty('address', '123 Street, City');
  });

  it('should get a gym by id', async () => {
    const gym = await Gyms.create({
      name: 'Gym1',
      phone: '1234567890',
      address: '123 Street, City'
    });

    const res = await request(app).get(`/api/gyms/${gym._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Gym1');
    expect(res.body).toHaveProperty('phone', '1234567890');
    expect(res.body).toHaveProperty('address', '123 Street, City');
  });

  it('should return 404 if gym not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/gyms/${nonExistentId}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error', 'Gym not found');
  });
});