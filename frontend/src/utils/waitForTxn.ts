const waitForTransactionConfirmation = async (transactionHash: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const checkConfirmation = async () => {
            try {
                const receipt = await window.ethereum.request({
                    method: 'eth_getTransactionReceipt',
                    params: [transactionHash],
                });

                if (receipt && receipt.blockNumber) {
                    // Transaction mined
                    resolve();
                } else {
                    // Retry after a delay
                    setTimeout(checkConfirmation, 1000);
                }
            } catch (error) {
                reject(error);
            }
        };

        // Start checking for confirmation
        checkConfirmation();
    });
};

export default waitForTransactionConfirmation;