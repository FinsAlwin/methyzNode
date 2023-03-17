const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema(
  {
    u_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Uid",
    },
    imageId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Images = mongoose.model("Images", ImageSchema);
module.exports = { Images };
