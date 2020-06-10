const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();

const app = express();

const connect = require("./model");
connect();

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const facetRouter = require("./routes/facet");
const detailRouter = require("./routes/detail");
const boardRouter = require("./routes/board");
const adminRouter = require("./routes/admin");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.use(cookieParser());
app.use("/assets", express.static(path.join(__dirname, "public/assets/"), { maxAge: "30d" }));
app.use("/public_img", express.static(path.join(__dirname, "public/images/"), { maxAge: "30d" }));
app.use("/public_js", express.static(path.join(__dirname, "public/javascripts/")));
app.use("/public_css", express.static(path.join(__dirname, "public/stylesheets/")));
app.use("/nm", express.static(path.join(__dirname, "node_modules/"), { maxAge: "30d" }));
app.use("/temps", express.static(path.join(__dirname, "temps/")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/facet", facetRouter);
app.use("/detail", detailRouter);
app.use("/board", boardRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
