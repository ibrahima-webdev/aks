import axios from 'axios';

const apiUrl = process.env.REACT_APP_BASE_API_URL;

export const api = axios.create({
  baseURL: apiUrl
});
