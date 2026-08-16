process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wonderlust-test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-jest-12345";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-refresh-secret-for-jest-12345";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
process.env.NODE_ENV = process.env.NODE_ENV || "test";
