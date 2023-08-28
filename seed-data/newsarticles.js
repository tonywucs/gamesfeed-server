require('dotenv').config();

const axios = require('axios');

const API_URL = process.env.NEWS_API_URL;
const API_KEY = process.env.NEWS_API_KEY;

const getNewsData = async (pref, pageSize) => {
    try {
        const { data } = await 
        axios.get(`${API_URL}?q=${pref}&language=en&pageSize=${pageSize}&apiKey=${API_KEY}`);
    
        return data;
    } catch (err) {
        console.error(err);
    }
    
}

module.exports = {
    getNewsData
}