const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Function to fetch SVG and append to a file
async function fetchAndAppendSVG(id) {
    const url = `https://www.mlbstatic.com/team-logos/team-cap-on-light/${id}.svg`;
    const filePath = path.join(__dirname, 'svgs.json'); // Path to the JSON file
  
    try {
      // Fetch the SVG content from the URL
      const response = await axios.get(url);
      const svgContent = response.data;
  
      // Extract the title from the SVG content
      const titleMatch = svgContent.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : 'No title found';
  
      // Create JSON object
      const svgData = {
        id: id,
        title: title,
        logo: url,
      };
  
      // Check if file exists
      let existingData = [];
      if (fs.existsSync(filePath)) {
        // Read existing file contents if the file exists
        const fileContents = fs.readFileSync(filePath, 'utf8');
        existingData = JSON.parse(fileContents);
      }
  
      // Append new data
      existingData.push(svgData);
  
      // Write updated data to file
      fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
      console.log(`SVG data appended to ${filePath}`);
  
    } catch (error) {
      console.error("Error fetching or saving SVG:", error);
    //   throw error;
    }
  }
  
  // Example usage
 

const getAllTeams = async () => {
    try {
        for(let i = 108; i <= 158; i++){
            const result = await fetchAndAppendSVG(String(i));

        }
    } catch(err){
        console.log(err);
    }
}

const getCount = async () => {
    const filePath = path.join(__dirname, 'svgs.json'); // Path to the JSON file
    if (fs.existsSync(filePath)) {
        // Read existing file contents if the file exists
        const fileContents = fs.readFileSync(filePath, 'utf8');
        console.log(`Count ${JSON.parse(fileContents).length}`);
    } else {
        console.log("file not found");
    }    
}

// getAllTeams();
getCount();