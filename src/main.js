import './styles.css';
import { APP_NAME } from './config.js';
import { startGame } from './game-client.js';

// App title comes from the ONE place: src/config.js
document.title = APP_NAME;

const metaApp = document.createElement('meta');
metaApp.name = 'application-name';
metaApp.content = APP_NAME;
document.head.appendChild(metaApp);

startGame();
