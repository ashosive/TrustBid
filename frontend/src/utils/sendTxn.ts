import waitForTransactionConfirmation from "./waitForTxn";

async function sendTxn(txn:object|string) {
    try {
        const result = await window.ethereum.request({ method: 'eth_sendTransaction', params: [JSON.parse(txn as string)]});
        console.log("metamask result ", result);

        const waitTxn = await waitForTransactionConfirmation(result);
        console.log(waitTxn);

        return true;
      } catch(err) {
        console.log("metamask err signing swap ");
        return false;
      }
}

export default sendTxn