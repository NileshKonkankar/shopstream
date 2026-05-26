process.env.NODE_ENV = "test";
process.env.PORT = "5000";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/shopstream_test";
process.env.JWT_SECRET = "test-secret-with-enough-length";
process.env.JWT_EXPIRES_IN = "1h";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.STRIPE_SECRET_KEY = "sk_test_mock";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_mock";
