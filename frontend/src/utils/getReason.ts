const getReason = (message:string) => {
    try {
        // Step 1: Extract the reason part of the error message
        const reasonStartIndex = message.indexOf('reason="') + 'reason="'.length;
        const reasonEndIndex = message.indexOf('"', reasonStartIndex);
        const reasonString = message.substring(reasonStartIndex, reasonEndIndex);
        console.log("reason ",reasonString);
        return reasonString;
    } catch(err) {
        console.log("error phrasing reason")
    }
}

export default getReason