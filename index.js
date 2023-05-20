const PORT = process.env.PORT || 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

const newspapers = [
  {
    name: 'theguardian',
    address: 'https://www.theguardian.com/uk/technology/all',
    base: 'https://www.theguardian.com/uk',
  },
];

app.get('/', (req, res) => {
  res.json('Welcome to my very first news API');
});

app.get('/news', (req, res) => {
  const articles = [];

  const fetchArticles = async () => {
    for (const newspaper of newspapers) {
      try {
        const response = await axios.get(newspaper.address);
        const html = response.data;
        const $ = cheerio.load(html);

        $('.fc-item .fc-item__content a[data-link-name="article"]', html).each(function () {
            const title = $('.js-headline-text', this).text();
            const url = $(this).attr('href');

          articles.push({
            title,
            url: url,
            source: newspaper.name,
          });
        });
      } catch (err) {
        console.log(err);
      }
    }

    res.json(articles);
  };

  fetchArticles();
});

app.get('/news/:newspaperId', (req, res) => {
  const newspaperId = req.params.newspaperId;
  const newspaper = newspapers.find((newspaper) => newspaper.name === newspaperId);

  if (!newspaper) {
    res.status(404).json({ error: 'Newspaper not found' });
    return;
  }

  axios
    .get(newspaper.address)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificNews = [];

      $('.fc-item .fc-item__content a[data-link-name="article"]', html).each(function () {
        const title = $('.js-headline-text',this).text();
        const url = $(this).attr('href');

        specificNews.push({
          title,
          url: url,
          source: newspaper.name,
        });
      });

      res.json(specificNews);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'An error occurred while fetching news' });
    });
});

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));


