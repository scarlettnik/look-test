import { WebApp } from '@twa-dev/sdk';

export const initTelegramWebApp = () => {
    WebApp.ready();
    WebApp.expand();
};