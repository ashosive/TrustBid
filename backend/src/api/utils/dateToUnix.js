function convertDateToUnix(date) {
    try {
        const convert_date = new Date(`${date} UTC-4`);
        console.log(convert_date.getSeconds())

        // Convert the date to a Unix timestamp (seconds since the Unix epoch).
        const unixTime = Math.floor(convert_date.getTime() / 1000);

        console.log(unixTime); // Outputs the Unix timestamp

        return { msg: unixTime, error: false };
    } catch(err) {
        return { msg: err.message, error: true };
    }
}

module.exports = { convertDateToUnix };