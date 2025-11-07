import axios from 'axios';

const API_URL = 'https://localhost:7023/api';

export const authService = {
    login: async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/Login`, credentials);
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'An error occurred during login' };
        }
    },

    logout: () => {
        localStorage.removeItem('user');
    },

    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/Login/register`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'An error occurred during registration' };
        }
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('user');
    }
};