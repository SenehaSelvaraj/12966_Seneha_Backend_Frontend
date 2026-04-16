import axios from 'axios';
 
// In Docker, Nginx proxies /api/users/ to user-service
// and /api/items/ to item-service
// So we use relative URLs — no port needed
 
export const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_API || 'http://localhost:8081'
});
 
export const itemApi = axios.create({
  baseURL: import.meta.env.VITE_ITEM_API || 'http://localhost:8082'
});
 