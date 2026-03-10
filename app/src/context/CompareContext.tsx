'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CompareContextType {
    compareCards: string[];
    addCard: (slug: string) => void;
    removeCard: (slug: string) => void;
    clearCards: () => void;
    isInCompare: (slug: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
    const [compareCards, setCompareCards] = useState<string[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('compareCards');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                queueMicrotask(() => setCompareCards(parsed));
            } catch (e) {
                console.error('Failed to parse compare cards from local storage', e);
            }
        }
    }, []);

    // Save to local storage whenever compareCards changes
    useEffect(() => {
        localStorage.setItem('compareCards', JSON.stringify(compareCards));
    }, [compareCards]);

    const addCard = (slug: string) => {
        if (compareCards.length < 3 && !compareCards.includes(slug)) {
            setCompareCards(prev => [...prev, slug]);
        }
    };

    const removeCard = (slug: string) => {
        setCompareCards(prev => prev.filter(s => s !== slug));
    };

    const clearCards = () => {
        setCompareCards([]);
    };

    const isInCompare = (slug: string) => {
        return compareCards.includes(slug);
    };

    return (
        <CompareContext.Provider value={{ compareCards, addCard, removeCard, clearCards, isInCompare }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
}
