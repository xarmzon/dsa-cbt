import mongoose from "mongoose";

export const connectDB = async () => {
  if (mongoose.connections[0].readState) {
    console.log("Already connected");
    return;
  }
  const db = await mongoose.connect(
    process.env.DATABASE_URI || "mongodb://localhost:27017/dsa-cbt",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  return db;
};

// pwd: wb0iqDRt9HpsTjFa
//db: DsaCbt?retryWrites=true&w=majority
