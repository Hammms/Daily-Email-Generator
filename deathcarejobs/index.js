require('dotenv').config({
  path: '../.env',
});
const { mjml: mjmlApi } = require('../lib/apis/mjml');
const { getListings } = require('../lib/apis/deathcarejobs');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const Handlebars = require('handlebars');
const mjmlTemplate = readFileSync(join(__dirname, 'template.mjml'));
const template = Handlebars.compile(mjmlTemplate.toString());

const now = new Date();
const mm = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');
const yyyy = now.getFullYear();

const date = `${mm}-${dd}-${yyyy}`;

function main() {
  return new Promise(async (resolve, reject) => {
    // fetch the latest dcj listings
    let listings;

    await getListings(8)
      .then((l) => (listings = l))
      .catch((err) => reject(err));

    resolve(
      template({
        listings: listings,
        utm: `utm_source=deathcarejobs&utm_medium=email&utm_campaign=new-job-listings_${date}`,
      })
    );
  });
}

main().then(async (template) => {
  try {
    writeFileSync('./email.mjml', template);
    const response = await mjmlApi(template);

    if (response.errors.length > 0) {
      console.error('MJML ERRORs:');
      for (let i = 0; i < response.errors.length; i++) {
        const err = response.errors[i];
        console.error(JSON.stringify(err, undefined, 2));
      }
    }

    writeFileSync('./email.html', response.html);

    console.log(`==> Done using MJML Version: ${response.mjml_version}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
