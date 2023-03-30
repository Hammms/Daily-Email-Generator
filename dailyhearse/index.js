// ------------------------------------------------------------------------
//  Edit the two variables below
// ------------------------------------------------------------------------

const articles = [
  'https://connectingdirectors.com/65383-ai-in-deathcare',
  `https://connectingdirectors.com/65386-transparency`,
  `https://connectingdirectors.com/65315-cybersecurity-for-deathcare`,
  `https://connectingdirectors.com/65368-2022-kip-award-winners`,
  `https://connectingdirectors.com/65354-2023-deathcare-survey-results`,
  `https://social.disruptmedia.co/blog/the-state-of-social-media-2023-funeral-edition`,
];

const promo = {
  enabled: false,
  title: null, // Optional
  url: 'https://us02web.zoom.us/webinar/register/9616360072994/WN_l7fhgeBqRuCOSp47h8pesg',
  image:
    'https://mcusercontent.com/6c8c75b1818585de1ff5f3b85/images/da46e8fb-4c2a-1783-7a55-5fb072f601d7.jpg',
  buttonText: 'Register for Free',
};

// ------------------------------------------------------------------------
//  No Mo Editing!
// ------------------------------------------------------------------------

// you can generate a preview of this by running `node index.js preview`
const preview = process.argv.slice(2)[0] == 'preview';

require('dotenv').config({
  path: '../.env',
});
const Handlebars = require('handlebars');
const fs = require('fs');
const template = Handlebars.compile(
  fs.readFileSync('./template.mjml').toString()
);
const { getListings } = require('../lib/apis/deathcarejobs');
const { getOpenGraphTags } = require('../lib/apis/openGraphTags');
const { mjml: mjmlApi } = require('../lib/apis/mjml');

const now = new Date();
const mm = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');
const yyyy = now.getFullYear();
const date = `${mm}-${dd}-${yyyy}`;

function main() {
  let templateData = {
    article_1: null,
    article_2: null,
    article_3: null,
    article_4: null,
    article_5: null,
    article_6: null,
    preview: preview,
    promo: promo,
    utm: `utm_source=connectingdirectors&utm_medium=email&utm_campaign=thedailyhearse_${date}`,
    jobListings: [],
  };
  return new Promise(async (resolve, reject) => {
    await getListings()
      .then((l) => (templateData.jobListings = l))
      .catch((err) => reject(err));

    for (let i = 0; i < articles.length; i++) {
      if (i > 5) break;
      const article = articles[i];

      if (typeof article === 'object') {
        // process a custom article slot
        // available keys: title, url, excerpt

        if (!article.hasOwnProperty('title')) {
          reject(`ERROR: article with index ${i} does not have the title key.`);
        }

        if (!article.hasOwnProperty('url')) {
          reject(`ERROR: article with index ${i} does not have the url key.`);
        }

        if (!article.hasOwnProperty('excerpt')) {
          reject(
            `ERROR: article with index ${i} does not have the excerpt key.`
          );
        }

        templateData[`article_${i + 1}`] = article;
      }

      if (typeof article === 'string') {
        await getOpenGraphTags(article)
          .then((res) => (templateData[`article_${i + 1}`] = res))
          .catch((err) => reject(err));
      }
    }

    resolve(templateData);
  });
}

main()
  .then(async (data) => {
    try {
      const output = template(data);

      fs.writeFileSync('./email.mjml', output);

      const response = await mjmlApi(output);

      // Since the MJML API uses an older version of MJML, there could
      // be more errors that are not really errors. They are basically
      // warnings, but the template still renders... usually.
      if (response.errors.length > 0) {
        console.error('MJML ERRORs:');
        for (let i = 0; i < response.errors.length; i++) {
          const err = response.errors[i];
          console.error(JSON.stringify(err, undefined, 2));
        }
      }

      fs.writeFileSync('./email.html', response.html);
      console.log(`Done using MJML Version: ${response.mjml_version}`);

      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error(error);
  });
