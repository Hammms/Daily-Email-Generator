require('dotenv').config({
  path: '../.env',
});

const prompts = require('prompts');

const Handlebars = require('handlebars');
const fs = require('fs');
const template = Handlebars.compile(
  fs.readFileSync('./template.mjml').toString()
);
const { getListings } = require('../lib/apis/deathcarejobs');
const { mjml: mjmlApi } = require('../lib/apis/mjml');
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

let templateData = {
  issueNumber: null,
  issueDate: null,
  featuredImageUrl: null,
  listings: [],
  utm: null,
};

const promptQuestions = [
  {
    type: 'number',
    name: 'issueNumber',
    message: 'What is this issue number?',
  },
  {
    type: 'text',
    name: 'featuredImageUrl',
    message: 'What is the featured image url?',
  },
  {
    type: 'date',
    name: 'issueDate',
    message: 'Issue Date',
    initial: new Date(),
    validate: (date) => (date > Date.now() ? true : 'Not in the past'),
  },
];

async function main() {
  return new Promise(async (resolve, reject) => {
    const promptResponse = await prompts(promptQuestions);
    const mm = String(promptResponse.issueDate.getMonth() + 1).padStart(2, '0');
    const dd = String(promptResponse.issueDate.getDate()).padStart(2, '0');
    const yyyy = promptResponse.issueDate.getFullYear();

    await getListings(5)
      .then((l) => (templateData.listings = l))
      .catch((err) => reject(err));

    templateData.utm = `utm_source=connectingdirectors&utm_medium=email&utm_campaign=fffw_${mm}-${dd}-${yyyy}`;
    templateData.issueDate = `${
      months[promptResponse.issueDate.getMonth()]
    } ${promptResponse.issueDate.getUTCDate()}, ${promptResponse.issueDate.getFullYear()}`;

    templateData.issueNumber = promptResponse.issueNumber;
    templateData.featuredImageUrl = promptResponse.featuredImageUrl;

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
      console.log(`==> Done using MJML Version: ${response.mjml_version}`);

      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
