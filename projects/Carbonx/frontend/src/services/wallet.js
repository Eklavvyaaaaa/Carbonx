// Wallet connection service using Pera Wallet Connect
import { PeraWalletConnect } from '@perawallet/connect';

const peraWallet = new PeraWalletConnect({
    chainId: 416002, // Algorand Testnet
});

let connectedAccount = null;
let onAccountChange = null;

export function setAccountChangeCallback(cb) {
    onAccountChange = cb;
}

export async function connectWallet() {
    try {
        const accounts = await peraWallet.connect();
        connectedAccount = accounts[0];

        peraWallet.connector?.on('disconnect', () => {
            connectedAccount = null;
            onAccountChange?.(null);
        });

        onAccountChange?.(connectedAccount);
        return connectedAccount;
    } catch (error) {
        if (error?.data?.type !== 'CONNECT_MODAL_CLOSED') {
            console.error('Wallet connection error:', error);
            throw error;
        }
        return null;
    }
}

export async function disconnectWallet() {
    try {
        await peraWallet.disconnect();
    } catch (e) {
        // ignore
    }
    connectedAccount = null;
    onAccountChange?.(null);
}

export function getConnectedAccount() {
    return connectedAccount;
}

export async function signTransactions(txnGroups) {
    // txnGroups: array of { txn, signers? }[]
    return await peraWallet.signTransaction([txnGroups]);
}

export { peraWallet };
