const axios = require('axios').default;
const cheerio = require('cheerio');

const getOpenGraphTags = (url) => {
  let errors = [];

  return new Promise((resolve, reject) => {
    axios
      .request({
        url: url,
        method: 'get',
        responseType: 'document',
      })
      .then((response) => {
        const $ = cheerio.load(response.data);

        let title = $('meta[property="og:title"]').attr('content');
        let url = $('meta[property="og:url"]').attr('content');
        let excerpt = $('meta[property="og:description"]').attr('content');

        if (title.endsWith(' | Connecting Directors')) {
          title = title.split(' | Connecting Directors')[0];
        }

        if (title === '' || title === null) {
          errors.push({
            message:
              'The requested URL does not have the og:title meta tag. Please use the custom article slot.',
            url: url,
          });
        }

        if (url === '' || url === null) {
          errors.push({
            message:
              'The requested URL does not have the og:url meta tag. Please use the custom article slot.',
            url: url,
          });
        }

        if (excerpt === '' || excerpt === null) {
          errors.push({
            message:
              'The requested URL does not have the og:description meta tag. Please use the custom article slot.',
            url: url,
          });
        }

        if (errors.length > 0) {
          reject({
            error: true,
            errors,
          });
        }

        resolve({
          title,
          url,
          excerpt,
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports.getOpenGraphTags = getOpenGraphTags;
