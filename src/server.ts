import express from 'express';
import cors from 'cors';
import router from './routes/index';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use(router);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Available routes:');
  console.log('- POST /api/auth/register');
  console.log('- POST /api/auth/login');
  console.log('- GET  /api/search');
  console.log('- POST /api/bookings');
  console.log('- GET  /api/bookings');
  console.log('- GET  /api/bookings/:id');
  console.log('- POST /api/bookings/:id/items');
  console.log('- POST /api/bookings/:id/promo');
  console.log('- POST /api/bookings/:id/pay');
  console.log('- PUT  /api/bookings/:id/cancel');
  console.log('- POST /api/reviews');
  console.log('- GET  /api/reviews');
  console.log('- GET  /api/flights');
  console.log('- GET  /api/hotels');
  console.log('- GET  /api/promos');
});

export default app;
