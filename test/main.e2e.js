const http = require("http");
const mongoose = require("mongoose");
const request = require("supertest");

const api = require("../src/api");
const { exec } = require("child_process");
const ResetTokenModel = require("../src/models/resetToken");

describe("Hobb.ee Backend", () => {
  let server;
  let token;
  let userId;

  beforeAll(async () => {
    api.set("port", 4001);
    server = http.createServer(api);

    await exec(
      "node scripts/import-tags.js && node scripts/import-example-images.js"
    );

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

  describe("Auth Controller", () => {
    it("/api/auth/exists/username (POST)", () => {
      return request(api)
        .post("/api/auth/exists/username")
        .send({ username: "Test" })
        .expect(200)
        .expect({ isUsernameAvailable: true });
    });

    it("/api/auth/register (POST)", () => {
      const data = {
        username: "Test",
        email: "test@hobb.ee",
        dateOfBirth: "2000-07-19T18:21:00+02:00",
        password: "SecurePassword12!",
        city: "City Name",
      };
      return request(api)
        .post("/api/auth/register")
        .send(data)
        .expect(200)
        .expect((resp) => !!resp.body.token);
    });

    it("/api/auth/login (POST)", () => {
      const data = {
        username: "Test",
        password: "SecurePassword12!",
      };
      return request(api)
        .post("/api/auth/login")
        .send(data)
        .expect(200)
        .expect((resp) => {
          token = resp.body.token;
          return !!token;
        });
    });

    it("/api/auth/logout (POST)", () => {
      return request(api)
        .post("/api/auth/logout")
        .set("Authorization", `JWT ${token}`)
        .send()
        .expect(200)
        .expect({ token: null });
    });
  });

  describe("User Controller", () => {
    it("/api/user/me (GET)", () => {
      return request(api)
        .get("/api/user/me")
        .set("Authorization", `JWT ${token}`)
        .expect(200)
        .expect((resp) => {
          userId = resp.body._id;
          return resp.body.username === "Test" && !!resp.body.email;
        });
    });

    it("/api/user/:username (GET)", () => {
      return request(api)
        .get("/api/user/test")
        .expect(200)
        .expect((resp) => resp.body.username === "Test" && !resp.body.email);
    });

    it("/api/user/update (POST)", () => {
      return request(api)
        .post("/api/user/update")
        .set("Authorization", `JWT ${token}`)
        .send({
          username: "Test",
          city: "New City",
          hobbies: ["60ecba45797ffd72e4d449ca"],
        })
        .expect(200)
        .expect(
          (resp) =>
            resp.body.username === "Test" &&
            resp.body.city === "New City" &&
            !!resp.body.email
        );
    });

    it("/api/user/updatePass (POST)", () => {
      return request(api)
        .post("/api/user/updatePass")
        .set("Authorization", `JWT ${token}`)
        .send({ current: "SecurePassword12!", password: "NewPassword34?" })
        .expect(200);
    });

    it("/api/user/forgot (POST)", () => {
      return request(api)
        .post("/api/user/forgot")
        .send({ email: "test@hobb.ee" })
        .expect(200);
    });

    it("/api/user/reset (POST)", () => {
      ResetTokenModel.findOne({ user: userId })
        .then((result) => {
          return request(api)
            .post("/api/user/reset")
            .send({
              user: "Test",
              token: result.token,
              password: "NewerPassword56?!",
            })
            .expect(200)
            .expect((resp) => {
              token = resp.body.token;
              return !!token;
            });
        })
        .catch((err) => {
          return false;
        });
    });

    it("/api/user/report/:username (POST)", () => {
      return request(api)
        .post("/api/user/report/test")
        .set("Authorization", `JWT ${token}`)
        .send({
          reportForm: {
            inappropriateUsername: true,
            comment: "I dont like tests",
          },
        })
        .expect(200);
    });
  });
});

/**
 * TODO:
 *  - /api/group
 *  - /api/storage
 *  - /api/payment
*/
