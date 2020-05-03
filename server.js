const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const api = require("./api");
const auth = require("./auth");
const middleware = require("./middleware");

const port = process.env.PORT || 1337;

const app = express();

app.use(middleware.cors);
app.use(bodyParser.json());
app.use(cookieParser());

app.post("/login", auth.authenticate, auth.login);
app.post("/register", api.createUser);

app.get("/announcements", auth.ensureUser, api.listAnnouncements);
app.post("/announcements", auth.ensureUser, api.createAnnouncement);
//app.put("/announcements/:id", auth.ensureUser, api.editAnnouncement);
//app.delete("/announcements/:id", auth.ensureUser, api.removeAnnouncement);

app.use(middleware.handleValidationError);
app.use(middleware.handleError);
app.use(middleware.notFound);

app.listen(port, () => console.log(`Server listening on port ${port}`));
