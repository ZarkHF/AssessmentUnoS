import { Global, css } from '@emotion/react';
import theme from './theme';

export const GlobalStyles = () => (
    <Global
        styles={css`
            @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=UnifrakturCook:wght@700&display=swap');

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: ${theme.fonts.body};
                background-color: ${theme.colors.background};
                color: ${theme.colors.text};
                line-height: 1.6;
            }

            h1, h2, h3, h4, h5, h6 {
                font-family: ${theme.fonts.secondary};
                margin-bottom: 1rem;
            }

            button {
                font-family: ${theme.fonts.primary};
                cursor: pointer;
                transition: ${theme.transitions.default};
                
                &:disabled {
                    cursor: not-allowed;
                    opacity: 0.7;
                }
            }

            input, select, textarea {
                font-family: ${theme.fonts.primary};
                background-color: ${theme.colors.background};
                color: ${theme.colors.text};
                border: 1px solid ${theme.colors.border};
                padding: 0.5rem 1rem;
                border-radius: ${theme.borderRadius.small};
                transition: ${theme.transitions.default};

                &:focus {
                    outline: none;
                    border-color: ${theme.colors.primary};
                    box-shadow: ${theme.shadows.glow};
                }
            }

            a {
                color: ${theme.colors.accent};
                text-decoration: none;
                transition: ${theme.transitions.default};

                &:hover {
                    color: ${theme.colors.primary};
                    text-shadow: ${theme.shadows.glow};
                }
            }
        `}
    />
);