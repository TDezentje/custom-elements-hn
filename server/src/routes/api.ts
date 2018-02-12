import api from 'decorators/http.decorator';
import { HackerNewsService } from 'services/hacker-news.service';

const services = [
    HackerNewsService
];

export default api;