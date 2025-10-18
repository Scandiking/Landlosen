import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark' | 'system';

function createThemeStore() {
    const stored = browser ? localStorage.getItem('theme') as Theme : 'system';
    const { subscribe, set } = writable<Theme>(stored || 'system');

    return {
        subscribe,
        set: (value: Theme) => {
            if (browser) {
                localStorage.setItem('theme', value);
                applyTheme(value);
            }
            set(value);
        },
        init: () => {
            if (browser) {
                const stored = localStorage.getItem('theme') as Theme || 'system';
                applyTheme(stored);
                set(stored);
            }
        }
    };
}

function applyTheme(theme: Theme) {
    if (!browser) return;

    const root = document.documentElement;

    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
    } else {
        root.classList.toggle('dark', theme === 'dark');
    }
}

export const theme = createThemeStore();
