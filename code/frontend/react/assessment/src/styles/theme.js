import { createTheme } from '@emotion/react';

export const theme = {
    colors: {
        primary: '#800000', // Deep blood red
        secondary: '#2B2B2B', // Dark charcoal
        background: '#1A1A1A', // Almost black
        text: '#FFFFFF',
        accent: '#C41E3A', // Crimson
        error: '#FF0000',
        success: '#006400', // Dark green
        border: '#4A4A4A',
        cardBg: '#2B2B2B',
        overlay: 'rgba(0, 0, 0, 0.8)'
    },
    fonts: {
        primary: "'Crimson Text', serif",
        secondary: "'UnifrakturCook', cursive",
        body: "'Crimson Text', serif"
    },
    shadows: {
        small: '0 2px 4px rgba(0, 0, 0, 0.3)',
        medium: '0 4px 8px rgba(0, 0, 0, 0.5)',
        large: '0 8px 16px rgba(0, 0, 0, 0.7)',
        glow: '0 0 10px rgba(128, 0, 0, 0.5)'
    },
    borderRadius: {
        small: '4px',
        medium: '8px',
        large: '12px'
    },
    transitions: {
        default: 'all 0.3s ease-in-out'
    }
};

export default theme;