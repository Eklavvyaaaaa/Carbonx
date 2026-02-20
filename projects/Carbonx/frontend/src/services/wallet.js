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

export async function reconnectSession() {
    try {
        const accounts = await peraWallet.reconnectSession();

        peraWallet.connector?.on('disconnect', () => {
            connectedAccount = null;
            onAccountChange?.(null);
        });

        if (accounts.length > 0) {
            connectedAccount = accounts[0];
            console.log('Session reconnected for:', connectedAccount);
            console.log('Is connected (after reconnect):', peraWallet.isConnected);
            onAccountChange?.(connectedAccount);
            return connectedAccount;
        }
    } catch (error) {
        console.error('Reconnect session error:', error);
    }
    return null;
}

export async function connectWallet() {
    try {
        const accounts = await peraWallet.connect();
        connectedAccount = accounts[0];

        peraWallet.connector?.on('disconnect', () => {
            connectedAccount = null;
            onAccountChange?.(null);
        });

        console.log('Connected to:', connectedAccount);
        console.log('Is connected (after connect):', peraWallet.isConnected);
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

/**
 * Sign transactions using Pera Wallet
 * @param {Array<{txn: Transaction, signers?: string[]}>} txnGroups - Array of transactions to sign (treated as one group)
 * @returns {Promise<Uint8Array[]>} - Array of signed transaction bytes
 */
export async function signTransactions(txnGroups) {
    console.log('[DEBUG] signTransactions called with:', txnGroups?.length, 'transactions');
    
    if (!peraWallet.isConnected && !connectedAccount) {
        const error = new Error('Wallet is not connected. Please connect your wallet first.');
        console.error('[DEBUG] Signing failure:', error);
        throw error;
    }

    if (!txnGroups || txnGroups.length === 0) {
        throw new Error('No transactions provided to sign');
    }

    try {
        // Pera Wallet expects SignerTransaction[][] = array of transaction GROUPS
        // Each group is SignerTransaction[] = array of { txn, signers? }
        // We're treating all incoming txns as ONE group
        const signerTransactions = txnGroups.map(g => {
            if (!g.txn) {
                throw new Error('Transaction object is missing');
            }
            return {
                txn: g.txn,
                signers: g.signers || [connectedAccount]
            };
        });

        // Wrap in array to create array of groups: [[{txn, signers}, ...]]
        const txGroupsForPera = [signerTransactions];

        console.log('[DEBUG] Calling peraWallet.signTransaction with', signerTransactions.length, 'transaction(s) in 1 group');
        const signedTxns = await peraWallet.signTransaction(txGroupsForPera);
        
        console.log('[DEBUG] signTransaction returned', signedTxns?.length, 'signed transaction(s)');
        
        if (!signedTxns || signedTxns.length === 0) {
            throw new Error('No signed transactions returned from wallet');
        }

        // Pera returns Uint8Array[] - a flat array of all signed transactions
        // This can be passed directly to sendRawTransaction
        return signedTxns;
    } catch (err) {
        console.error('[DEBUG] signTransactions error:', err);
        
        // Provide user-friendly error messages
        if (err?.message?.includes('User rejected') || err?.message?.includes('User cancelled')) {
            throw new Error('Transaction was cancelled by user');
        }
        if (err?.message?.includes('not connected')) {
            throw new Error('Wallet is not connected. Please connect your wallet first.');
        }
        
        throw err;
    }
}

export { peraWallet };
