const axios = require('axios').default;

const endpoint = 'https://api.mjml.io/v1/render';

const mjml = (mjml, json = false) => {
  return new Promise((resolve, reject) => {
    if (json) {
      mjml = JSON.stringify(mjml);
    }

    axios
      .request({
        url: endpoint,
        method: 'post',
        data: {
          mjml: mjml,
        },
        auth: {
          username: process.env.MJML_API_APP_ID,
          password: process.env.MJML_API_SEC_KEY,
        },
      })
      .then((response) => resolve(response.data))
      .catch((err) => reject(err));
  });
};

module.exports.mjml = mjml;
