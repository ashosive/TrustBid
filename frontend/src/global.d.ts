
interface Ethereum {
    on: (event: string, handler: (...args: any[]) => void) => void;
    request: (args: { method: string, params?: any[] }) => Promise<any>;
}

interface Window {
    ethereum: Ethereum;
}