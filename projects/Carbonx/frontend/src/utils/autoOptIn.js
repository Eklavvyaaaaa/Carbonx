/**
 * Auto opt-in utility - automatically opts in to CXT when needed
 * This makes the user experience seamless - no manual opt-in buttons needed
 */

import { checkCXTOptIn, optInToCXT } from '../services/contracts';
import { getAlgoBalance } from '../services/algorand';

/**
 * Ensures the user is opted in to CXT asset
 * If not opted in, automatically performs opt-in transaction
 * @param {string} account - User's account address
 * @param {Function} toast - Toast function for notifications
 * @returns {Promise<boolean>} - True if opted in (or successfully opted in), false if failed
 */
export async function ensureOptedIn(account, toast) {
    if (!account) {
        toast?.error('Please connect your wallet first');
        return false;
    }

    try {
        // Check if already opted in
        const isOptedIn = await checkCXTOptIn(account);
        if (isOptedIn) {
            return true;
        }

        // Check ALGO balance
        const algoBal = await getAlgoBalance(account);
        if (algoBal < 101000) {
            toast?.error('Insufficient ALGO. You need at least 0.101 ALGO to opt-in. Please fund your wallet: https://bank.testnet.algorand.network/');
            return false;
        }

        // Auto opt-in
        toast?.info('Opting in to $CXT token...');
        await optInToCXT(account);

        // Wait a moment for indexer to catch up
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify opt-in succeeded
        const verified = await checkCXTOptIn(account);
        if (verified) {
            toast?.success('Successfully opted in to $CXT!');
            return true;
        } else {
            // Retry check after another delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            const retryCheck = await checkCXTOptIn(account);
            if (retryCheck) {
                toast?.success('Successfully opted in to $CXT!');
                return true;
            }
            toast?.warning('Opt-in transaction confirmed, but status may take a moment to update.');
            return true; // Assume success if transaction went through
        }
    } catch (error) {
        console.error('[AutoOptIn] Error:', error);
        const errorMsg = error.message || 'Unknown error';

        if (errorMsg.includes('cancel') || errorMsg.includes('rejected') || errorMsg.includes('cancelled')) {
            toast?.warning('Opt-in was cancelled. Please try again.');
        } else if (errorMsg.includes('Insufficient ALGO') || errorMsg.includes('balance')) {
            // Already shown toast above
        } else {
            toast?.error(`Opt-in failed: ${errorMsg}`);
        }
        return false;
    }
}
