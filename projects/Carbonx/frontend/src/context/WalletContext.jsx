import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { connectWallet, disconnectWallet, setAccountChangeCallback } from '../services/wallet';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
    const [account, setAccount] = useState(null);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        setAccountChangeCallback((addr) => {
            setAccount(addr);
        });
    }, []);

    const connect = useCallback(async () => {
        setConnecting(true);
        try {
            const addr = await connectWallet();
            setAccount(addr);
            return addr;
        } catch (e) {
            console.error(e);
            return null;
        } finally {
            setConnecting(false);
        }
    }, []);

    const disconnect = useCallback(async () => {
        await disconnectWallet();
        setAccount(null);
    }, []);

    const shortAddress = account
        ? `${account.slice(0, 6)}...${account.slice(-4)}`
        : null;

    return (
        <WalletContext.Provider value={{ account, shortAddress, connecting, connect, disconnect }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const ctx = useContext(WalletContext);
    if (!ctx) throw new Error('useWallet must be used within WalletProvider');
    return ctx;
}
