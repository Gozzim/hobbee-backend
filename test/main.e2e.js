const http = require("http");
const mongoose = require("mongoose");
const request = require("supertest");

const api = require("../src/api");

describe("Hobb.ee Backend", () => {
  let server;

  beforeAll(async () => {
    api.set("port", 4001);
    server = http.createServer(api);
    await mongoose.connect("mongodb://localhost:27017/hobbee", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      autoIndex: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    server.close();
  });

  it("/api (GET)", () => {
    return request(api)
      .get("/api")
      .expect(200)
      .expect({ name: "Hobb.ee Backend" });
  });
});
