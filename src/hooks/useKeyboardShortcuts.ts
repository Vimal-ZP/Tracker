import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Cmd/Ctrl + K for global search
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                
                // Check if we're on mobile/tablet or desktop
                const isMobile = window.innerWidth < 768;
                
                if (isMobile) {
                    // Navigate to search page on mobile
                    router.push('/search');
                } else {
                    // Trigger global search modal on desktop
                    const searchButton = document.querySelector('[data-global-search-trigger]') as HTMLButtonElement;
                    if (searchButton) {
                        searchButton.click();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [router]);
}
