const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MethyzAcupressureSchema = new Schema(
  {
    pv_id: {
      type: String,
      unique: true,
      required: false,
    },
    u_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Uid",
    },
    sole: {
      type: String,
      required: true,
    },
    strapRight: {
      type: String,
      required: true,
    },
    strapLeft: {
      type: String,
      required: true,
    },
    studRight: {
      type: String,
      required: true,
    },
    studLeft: {
      type: String,
      required: true,
    },
    soleSize: {
      type: String,
      required: true,
    },
    strapSize: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const MethyzAcupressure = mongoose.model(
  "MethyzAcupressure",
  MethyzAcupressureSchema
);

module.exports = { MethyzAcupressure };
