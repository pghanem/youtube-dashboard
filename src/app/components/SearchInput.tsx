'use client';

import { ChangeEvent, JSX, useEffect, useState } from 'react';
import Image from 'next/image';

interface SearchInputProps {
    onSearch: (searchTerm: string) => void;
}

/**
 * SearchInput - A search input component that includes a logo and manages the search input state. Responsible for capturing
 *               user input and invoking the provided callback function when the search term changes.
 *
 * @param {(searchTerm: string) => void} onSearch - Callback function that is called with the search term when the user submits or changes it.
 *
 * @returns {JSX.Element} - Returns a JSX element for a search input field with a logo.
 */
export default function SearchInput({
    onSearch,
}: SearchInputProps): JSX.Element {
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        const delay = setTimeout(() => {
            onSearch(searchInput);
        }, 500);

        return () => clearTimeout(delay);
    }, [searchInput, onSearch]);

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setSearchInput(event.target.value);
    };

    return (
        <div className="flex sticky bg-white p-4">
            <div className="w-[120px] relative mr-4">
                <Image
                    src="/yt_logo_rgb_light.png"
                    fill
                    alt="YouTube Logo"
                    className="object-contain"
                    unoptimized
                />
            </div>
            <input
                className="w-full px-4 py-2 border rounded-[50px]"
                type="text"
                id="search"
                placeholder="Search"
                value={searchInput}
                onChange={handleSearchChange}
            />
        </div>
    );
}
