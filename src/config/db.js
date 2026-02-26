import mongoose from 'mongoose';

const MAX_RETRIES = Number(process.env.DB_MAX_RETRIES) || 5;
const RETRY_DELAY = Number(process.env.DB_RETRY_DELAY_MS) || 5000;

const getConnectionState = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    code: mongoose.connection.readyState,
    state: states[mongoose.connection.readyState] || 'unknown',
  };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;

      const conn = await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      const { code, state } = getConnectionState();

      console.log(`MongoDB Connected: ${conn.connection.host}`);
      console.log(`Connection State Code: ${code}`);
      console.log(`Connection State: ${state}`);

      mongoose.connection.on('disconnected', () => {
        const s = getConnectionState();
        console.error(`MongoDB Disconnected | Code: ${s.code} | State: ${s.state}`);
      });

      mongoose.connection.on('reconnected', () => {
        const s = getConnectionState();
        console.log(`MongoDB Reconnected | Code: ${s.code} | State: ${s.state}`);
      });

      mongoose.connection.on('error', (err) => {
        const s = getConnectionState();
        console.error(`MongoDB Error: ${err.message} | Code: ${s.code} | State: ${s.state}`);
      });

      return;
    } catch (error) {
      const { code, state } = getConnectionState();

      console.error(`DB Connection Attempt ${attempt} Failed`);
      console.error(`Error: ${error.message}`);
      console.error(`Current State Code: ${code}`);
      console.error(`Current State: ${state}`);

      if (attempt >= MAX_RETRIES) {
        console.error('Max retry limit reached. Exiting process.');
        process.exit(1);
      }

      await sleep(RETRY_DELAY);
    }
  }
};

export default connectDB;
