const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UidSchema = new Schema(
  {
    u_id: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

const Uid = mongoose.model("Uid", UidSchema);
module.exports = { Uid };
