const express = require("express");
const router = express.Router();
const {
  isRequestValidated,
  validate,
} = require("../../../validators/request_validator");

const { productVarificationCheck, updateProduct } = require("./app.service");
const { body, query } = require("express-validator");

router.post("/product-varification-check", function (req, res, next) {
  productVarificationCheck(req)
    .then(({ statusCode, data, flag, message }) => {
      res.status(statusCode).json({ data, flag, message });
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/update-product", function (req, res, next) {
  updateProduct(req)
    .then(({ statusCode, url, message }) => {
      res.status(statusCode).json({ url, message });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
