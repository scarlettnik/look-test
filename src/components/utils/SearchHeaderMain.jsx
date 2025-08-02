import { useState, useEffect, useRef } from 'react';
import styles from '../ui/search.module.css';
import { AUTH_TOKEN } from "../../constants.js";
import {useStore} from "../../provider/StoreContext.jsx";

export const SearchHeader = ({ onSearch, onClearSearch }) => {
    const [isSearchActive, setIsSearchActive] = useState(false);
    const store = useStore();
    const [searchQuery, setSearchQuery] = useState(store?.catalogStore?.currentSearchQuery);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef(null);
    const inputRef = useRef(null);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchActive(false);
            }
        };

        if (isSearchActive) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchActive]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && isSearchActive) {
                handleSearch();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSearchActive, searchQuery]);

    useEffect(() => {
        if (searchQuery && isSearchActive) {
            const timer = setTimeout(() => {
                fetchSuggestions(searchQuery);
            }, 100);

            return () => clearTimeout(timer);
        } else {
            setSuggestions([]);
        }
    }, [searchQuery, isSearchActive]);

    const fetchSuggestions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('https://api.lookvogue.ru/v1/catalog/search/suggestions', {
                method: 'POST',
                headers: {
                    "Authorization": `tma ${AUTH_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ query: searchQuery })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch suggestions');
            }

            const data = await response.json();
            setSuggestions(data || []);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        inputRef.current?.focus();
        handleSearch(suggestion);
    };
    const handleSearch = (query = searchQuery) => {
        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            const searchRequest = { query: trimmedQuery };
            console.log(trimmedQuery)
            store.catalogStore.setLastSearchQuery(trimmedQuery);

            if (onSearch) {
                onSearch(searchRequest);
            }

            setIsSearchActive(false);
            setSuggestions([]);
        }
    };

    const handleClearInput = () => {
        setSearchQuery('');
        setSuggestions([]);
        store.catalogStore.clearLastSearchQuery();
        inputRef.current?.focus();
        onClearSearch?.();
    };
    return (
        <>
            {isSearchActive && (
                <div
                    className={styles.searchOverlay}
                    onClick={() => setIsSearchActive(false)}
                />
            )}

            <div className={styles.searchWrapper} ref={searchRef} style={{ zIndex: isSearchActive ? 100 : 1 }}>
                <div className={styles.searchContainer}>
                    <div className={styles.searchHeaderWrapper}>
                        <div className={styles.searchHeader}>
                            <span
                                className={styles.searchIcon}
                                onClick={() => handleSearch()}
                                role="button"
                                tabIndex={0}
                            >
                                <img src="/subicons/search.svg" alt="Search"/>
                            </span>

                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                placeholder="Стиль, повод, настроение"
                                className={styles.searchInput}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchActive(true)}
                                onBlur={() => {
                                    if (!searchQuery) {
                                        setIsSearchActive(false);
                                    }
                                }}
                                aria-haspopup="listbox"
                                aria-expanded={isSearchActive && suggestions.length > 0}
                            />

                            {searchQuery && (
                                <span
                                    className={styles.clearIcon}
                                    onClick={handleClearInput}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <img src="/subicons/close.svg" alt="Clear"/>
                                </span>
                            )}
                        </div>
                    </div>

                    {isSearchActive && (
                        <div
                            className={styles.suggestionsWrapper}
                            role="listbox"
                        >
                            {isLoading ? (
                                <div className={styles.suggestionItem}>Загрузка...</div>
                            ) : suggestions.length > 0 ? (
                                suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className={styles.suggestionItem}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        role="option"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSuggestionClick(suggestion);
                                            }
                                        }}
                                    >
                                        {suggestion}
                                    </div>
                                ))
                            ) : searchQuery && !isLoading ? (
                                <div className={styles.suggestionItem}>Ничего не найдено</div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};