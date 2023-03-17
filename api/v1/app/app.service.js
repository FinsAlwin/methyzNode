const { Uid } = require("../../../models/uId.model");
const { MethyzKids } = require("../../../models/methyzKids.model");
const { MethyzAdults } = require("../../../models/methyzAdults.model");
const { Images } = require("../../../models/image.model");
const {
  MethyzAcupressure,
} = require("../../../models/methyzAcupressure.model");
const {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} = require("../../../utils/api_error_util");
const axios = require("axios");
const fs = require("fs");

const apiUrl = "https://methyz.parel.co/";

const productVarificationCheck = async ({ body }) => {
  const {
    unique_id,
    product_slug,
    attributes,
    price,
    regular_price,
    sale_price,
    sku,
    weight,
    stock_quantity,
    stock_status,
    productId,
  } = body;

  const dataPayload = {
    price: price,
    regular_price: regular_price,
    sale_price: price,
    attributes: attributes,
    sku: sku,
    weight: weight,
    stock_quantity: stock_quantity,
    stock_status: stock_status,
  };

  let uid;

  const UidExists = await Uid.findOne({
    u_id: unique_id,
  });

  if (!UidExists) {
    const UidData = new Uid({
      u_id: unique_id,
    });

    const save = await UidData.save();
    uid = save._id;
  } else {
    uid = UidExists._id;
  }

  const data = await productExist(
    uid,
    product_slug,
    attributes,
    dataPayload,
    productId
  );

  // if (!url.length) {
  //   throw new NotFoundError("No Url found");
  // }
  return {
    statusCode: 200,
    data: data,
    message: "Data fetched successfully",
  };
};

const addImage = async (req) => {
  const title = req.body.title; // Get the value of the "title" field
  const fileData = req.files.file.data; // Get the uploaded file data
  const unique_id = req.body.unique_id;
  const productId = req.body.productId;
  const product_slug = req.body.product_slug;
  const pv_id = req.body.pv_id;

  const formData = new FormData();
  const fileBlob = new Blob([fileData], { type: "image/jpeg" }); // create a Blob from the file data

  formData.append("file", fileBlob, "image.jpg");
  formData.append("title", title);
  formData.append("alt_text", "Image Alt Text");

  const UidExists = await Uid.findOne({
    u_id: unique_id,
  });

  const res = await uploadImage(formData, UidExists._id);

  const ImagesData = new Images({
    u_id: UidExists._id,
    imageId: res.data.id,
  });

  const data = await ImagesData.save();

  await updateProductVariation(
    productId,
    product_slug,
    UidExists._id,
    data.imageId,
    pv_id
  );

  return {
    statusCode: 200,
    message: "Data fetched successfully",
  };
};

module.exports = {
  productVarificationCheck,
  addImage,
};

async function productExist(
  unique_id,
  product_slug,
  payload,
  dataPayload,
  productId
) {
  const data = {
    sole: "",
    strapRight: "",
    strapLeft: "",
    studRight: "",
    studLeft: "",
    soleSize: "",
    strapSize: "",
  };

  for (const option of payload) {
    switch (option.name) {
      case "Sole Size":
        data.soleSize = option.option;
        break;
      case "Left Stud":
        data.studLeft = option.option;
        break;
      case "Right Stud":
        data.studRight = option.option;
        break;
      case "Sole":
        data.sole = option.option;
        break;
      case "Left Strap":
        data.strapLeft = option.option;
        break;
      case "Right Strap":
        data.strapRight = option.option;
        break;
      case "Strap Size":
        data.strapSize = option.option;
        break;
      default:
      // handle unknown option
    }
  }

  if (product_slug === "kids-raaga") {
    const MethyzKidsExists = await MethyzKids.findOne({
      sole: data.sole,
      strapRight: data.strapRight,
      strapLeft: data.strapLeft,
      studRight: data.studRight,
      studLeft: data.studLeft,
      soleSize: data.soleSize,
      strapSize: data.strapSize,
    });

    if (MethyzKidsExists) {
      return MethyzKidsExists;
    } else {
      const dataSave = await createProductVariation(
        product_slug,
        data,
        unique_id,
        productId,
        dataPayload
      );
      return dataSave;
    }
  } else if (product_slug === "adults-ragga") {
    const MethyzAdultsExists = await MethyzAdults.findOne({
      sole: data.sole,
      strapRight: data.strapRight,
      strapLeft: data.strapLeft,
      studRight: data.studRight,
      studLeft: data.studLeft,
      soleSize: data.soleSize,
      strapSize: data.strapSize,
    });

    if (MethyzAdultsExists) {
      return MethyzAdultsExists.url;
    } else {
      const dataSave = await createProductVariation(
        product_slug,
        data,
        unique_id,
        productId,
        dataPayload
      );
      return dataSave;
    }
  } else if (product_slug === "adults-yoga") {
    const MethyzAcupressureExists = await MethyzAcupressure.findOne({
      sole: data.sole,
      strapRight: data.strapRight,
      strapLeft: data.strapLeft,
      studRight: data.studRight,
      studLeft: data.studLeft,
      soleSize: data.soleSize,
      strapSize: data.strapSize,
    });

    if (MethyzAcupressureExists) {
      return MethyzAcupressureExists.url;
    } else {
      const dataSave = await createProductVariation(
        product_slug,
        data,
        unique_id,
        productId,
        dataPayload
      );
      return dataSave;
    }
  }
}

async function createProductVariation(
  product_slug,
  pdata,
  unique_id,
  productId,
  payload
) {
  const data = pdata;
  return axios
    .post(
      `${apiUrl}wp-json/wc/v3/products/${productId}/variations?consumer_key=ck_9d61dc44c41c73983a3f3c026b7f2268f139b1f9&consumer_secret=cs_a7360bffc944026d40522232cfa40da8f4181a3b`,
      payload
    )
    .then(async (response) => {
      if (product_slug === "kids-raaga") {
        const saveData = new MethyzKids({
          u_id: unique_id,
          sole: data.sole,
          strapRight: data.strapRight,
          strapLeft: data.strapLeft,
          studRight: data.studRight,
          studLeft: data.studLeft,
          soleSize: data.soleSize,
          strapSize: data.strapSize,
          url: response.data.permalink,
          pv_id: response.data.id,
        });
        await saveData.save();
        return saveData;
      } else if (product_slug === "adults-ragga") {
        const saveData = new MethyzAdults({
          u_id: unique_id,
          sole: data.sole,
          strapRight: data.strapRight,
          strapLeft: data.strapLeft,
          studRight: data.studRight,
          studLeft: data.studLeft,
          soleSize: data.soleSize,
          strapSize: data.strapSize,
          url: response.data.permalink,
          pv_id: response.data.id,
        });
        await saveData.save();
        return saveData;
      } else if (product_slug === "adults-yoga") {
        const saveData = new MethyzAcupressure({
          u_id: unique_id,
          sole: data.sole,
          strapRight: data.strapRight,
          strapLeft: data.strapLeft,
          studRight: data.studRight,
          studLeft: data.studLeft,
          soleSize: data.soleSize,
          strapSize: data.strapSize,
          url: response.data.permalink,
          pv_id: response.data.id,
        });
        await saveData.save();
        return saveData;
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

async function uploadImage(payload, unique_id) {
  const username = "alwin";
  const password = "Oo9s wlkg dnHz mEGT joig 46Db";

  // Encode the credentials using Base64
  const credentials = Buffer.from(`${username}:${password}`, "utf8").toString(
    "base64"
  );
  return axios
    .post(`${apiUrl}wp-json/wp/v2/media`, payload, {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "multipart/form-data",
      },
    })
    .then(async (response) => {
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
}

async function updateProductVariation(
  productId,
  product_slug,
  uid,
  imageId,
  pv_id
) {
  if (product_slug === "kids-raaga") {
    return axios
      .put(
        `${apiUrl}wp-json/wc/v3/products/${productId}/variations/${pv_id}?consumer_key=ck_9d61dc44c41c73983a3f3c026b7f2268f139b1f9&consumer_secret=cs_a7360bffc944026d40522232cfa40da8f4181a3b`,
        {
          image: {
            id: imageId,
          },
        }
      )
      .then(async (response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });
  } else if (product_slug === "adults-ragga") {
    axios
      .put(
        `${apiUrl}wp-json/wc/v3/products/${productId}/variations/${pv_id}?consumer_key=ck_9d61dc44c41c73983a3f3c026b7f2268f139b1f9&consumer_secret=cs_a7360bffc944026d40522232cfa40da8f4181a3b`,
        {
          image: {
            id: imageId,
          },
        }
      )
      .then(async (response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });
  } else if (product_slug === "adults-yoga") {
    axios
      .put(
        `${apiUrl}wp-json/wc/v3/products/${productId}/variations/${pv_id}?consumer_key=ck_9d61dc44c41c73983a3f3c026b7f2268f139b1f9&consumer_secret=cs_a7360bffc944026d40522232cfa40da8f4181a3b`,
        {
          image: {
            id: imageId,
          },
        }
      )
      .then(async (response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
