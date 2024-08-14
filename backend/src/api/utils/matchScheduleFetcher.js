const axios = require('axios');
const cheerio = require('cheerio');
const teams = require("./teams.json");

async function fetchMatches(date) {
    try {
        const url = `https://www.mlb.com/schedule/${date}`; // eg 2024-08-07
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

        return {msg: data, error: false};
    } catch (error) {
        console.error('Error fetching the URL', error);
        return { msg: error.message, error: true };
    }
}

async function fetchMatchInfo(date,title) {
    try {
        const matches = await fetchMatches(date);

        if(matches.error){
            throw new Error(matches.msg);
        }

        const textDate = formatDateToText(date);

        if(textDate.error){
            throw new Error(textDate.msg);
        }

        const [awayTeam, homeTeam] = title.split(' vs ');

        const matchInfo = matches.msg
            .find(dayEntry => dayEntry.date === textDate.msg)
            ?.games
            .find(game => game.awayTeam === awayTeam && game.homeTeam === homeTeam) || null;
        
        console.log(matchInfo);

        if(!matchInfo) {
            throw new Error("match not found!");
        }
        
        return { msg: matchInfo, error: false };
    } catch(error) {
        console.error('Error fetching team info', error);
        return { msg: error.message, error: true };
    }
}

function formatDateToText(dateString) {
    try {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
    
        const date = new Date(dateString);
        const day = date.getDate();
        const month = months[date.getMonth()];
    
        const result =  `${month} ${day}`;

        return { msg: result, error: false };
    } catch(error) {
        console.error('Error in converting date to text date ', error);
        return { msg: error.message, error: true };
    }
}


module.exports = { fetchMatches, fetchMatchInfo };