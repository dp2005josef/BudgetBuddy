import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import '@angular/compiler'; // Importando o compilador para JIT
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));