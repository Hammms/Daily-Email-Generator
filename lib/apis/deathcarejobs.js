const axios = require('axios').default;
const { DOMParser } = require('xmldom');
function getListings() {
  return new Promise((resolve, reject) => {
    axios.get('https://deathcarejobs.myjboard.io/rss/jobs')
      .then(response => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, 'text/xml');
        const items = Array.from(xmlDoc.getElementsByTagName('item')).map(item => {
          return {
            title: item.getElementsByTagName('title')[0].textContent,
            
            excerpt: item.getElementsByTagName('description')[0].textContent,
            location: item.getElementsByTagName('location')[0].textContent,
            pubDate: item.getElementsByTagName('pubDate')[0].textContent,
            link: item.getElementsByTagName('link')[0].textContent,
            image: item.getElementsByTagName('image')[0].textContent,
            mediaContent: item.getElementsByTagName('media:content')[0]?.getAttribute('url')
          };
        });
        console.log(items);
        resolve(items.slice(0, 5));
      })
      .catch(error => reject(error));
  });
}


module.exports.getListings = getListings;