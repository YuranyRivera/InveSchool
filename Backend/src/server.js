import { createApp } from './app.js';
import { config } from './config/env.js';

createApp().listen(config.port, () => {
  console.log(`API escuchando en el puerto ${config.port}`);
});
