import axios from 'axios';

const API_URL = 'https://localhost:7023/api/Books';

// Add auth token to requests
axios.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

export const bookService = {
    getAll: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to fetch books' };
        }
    },

    add: async (book) => {
        try {
            const response = await axios.post(API_URL, book);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to add book' };
        }
    },

    update: async (id, book) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, book);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to update book' };
        }
    },

    delete: async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
        } catch (error) {
            throw error.response?.data || { error: 'Failed to delete book' };
        }
    }
};