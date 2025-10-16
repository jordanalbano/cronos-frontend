import { KeycloakService } from 'keycloak-angular';

/**
 * Factory para la inicialización de Keycloak.
 * En esta fase inicial, simplemente retorna una promesa resuelta para simular
 * la inicialización sin conectar a un Keycloak real.
 */
export function initializeKeycloakFactory(keycloak: KeycloakService): () => Promise<any> {
    return () =>
        new Promise((resolve) => {
            console.log('[KeycloakInit] Mock initialization complete.');
            resolve(true);
            /*
            // Ejemplo de configuración real de Keycloak
            keycloak.init({
                config: {
                    url: 'http://localhost:8080',
                    realm: 'your-realm',
                    clientId: 'your-client-id'
                },
                initOptions: {
                    onLoad: 'check-sso',
                    silentCheckSsoRedirectUri:
                        window.location.origin + '/assets/silent-check-sso.html'
                }
            })
            .then(resolve)
            .catch(e => {
                console.error('Error initializing Keycloak', e);
                resolve(false); // Resolve false to allow app to continue without auth for dev
            });
            */
        });
}
