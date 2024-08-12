const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://www.mlb.com/schedule/2024-08-07';

async function fetchData() {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const data = [];
        $('#gridWrapper > div').each((i, el) => {
            const element = $(el);

            if (element.attr('data-mlb-test') === 'gameCardTitles') {
                const day = element.find('.ScheduleCollectionGridstyle__DateLabel-sc-c0iua4-5.iaVuoa').text().trim();
                const date = element.find('.ScheduleCollectionGridstyle__DateLabel-sc-c0iua4-5.fQIzmH').text().trim();
                currentDate = { day, date, games: [] };
                data.push(currentDate);
            }

            if (element.attr('data-mlb-test') === 'individualGamesContainer') {
                if (currentDate.games) {
                    element.find('div[data-mlb-test="individualGameContainerDesktop"]').each((j, gameEl) => {
                        const gameElement = $(gameEl);

                        const awayTeam = gameElement.find('.TeamMatchupLayerstyle__AwayWrapper-sc-ouprud-1 .TeamWrappersstyle__DesktopTeamWrapper-sc-uqs6qh-0').text().trim();
                        const homeTeam = gameElement.find('.TeamMatchupLayerstyle__HomeWrapper-sc-ouprud-2 .TeamWrappersstyle__DesktopTeamWrapper-sc-uqs6qh-0').text().trim();
                        const gameInfo = gameElement.find('.GameInfoLayerstyle__GameInfoTextWrapper-sc-1xxsnoa-1 a').text().trim();

                        currentDate.games.push({ awayTeam, homeTeam, gameInfo });
                    });
                }
            }
        });

        fs.writeFile('./schedule-scrapper/games-data.json', JSON.stringify(data, null, 2), err => {
            if (err) {
                console.error('Error writing to file', err);
            } else {
                console.log('Data saved to games-data.json');
            }
        });
    } catch (error) {
        console.error('Error fetching the URL', error);
    }
}

fetchData()