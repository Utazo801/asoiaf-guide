import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';


/**
 * Providers for the application configuration.
 * Provides the router configuration based on the specified routes.
 * Provides the HTTP client configuration for making HTTP requests.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient()],
};
