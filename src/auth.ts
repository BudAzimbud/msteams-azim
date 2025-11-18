import {
  ConfidentialClientApplication,
  ClientCredentialRequest,
  AuthenticationResult,
} from "@azure/msal-node";
import { Client, AuthenticationProvider } from "@microsoft/microsoft-graph-client";
import { MSGraphConfig } from "./types";
import { AuthenticationError, ConfigurationError } from "./errors";
import { ILogger, SilentLogger } from "./logger";

/**
 * Interface for authentication providers
 */
export interface IAuthProvider {
  getClient(): Promise<Client>;
  getAccessToken(): Promise<string>;
  testConnection(): Promise<boolean>;
}

/**
 * MSAL Authentication Provider
 * Handles Microsoft Graph authentication using client credentials flow
 * 
 * Single Responsibility: Only handles authentication
 */
export class MSALAuthProvider implements IAuthProvider {
  private clientApp: ConfidentialClientApplication;
  private graphClient: Client | null = null;
  private logger: ILogger;

  constructor(
    private config: Pick<MSGraphConfig, 'clientId' | 'clientSecret' | 'tenantId'>,
    logger?: ILogger
  ) {
    this.logger = logger || new SilentLogger();

    if (!config.clientId || !config.clientSecret || !config.tenantId) {
      throw new ConfigurationError(
        'Missing required configuration: clientId, clientSecret, and tenantId are required'
      );
    }

    this.clientApp = new ConfidentialClientApplication({
      auth: {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
      },
    });

    this.logger.debug('MSAL Auth Provider initialized');
  }

  /**
   * Get authenticated Microsoft Graph client
   */
  async getClient(): Promise<Client> {
    if (this.graphClient) {
      return this.graphClient;
    }

    try {
      this.logger.debug('Initializing Graph client...');

      const authProvider: AuthenticationProvider = {
        getAccessToken: async () => {
          return await this.getAccessToken();
        },
      };

      this.graphClient = Client.initWithMiddleware({
        authProvider,
      });

      this.logger.info('Graph client initialized successfully');
      return this.graphClient;
    } catch (error: any) {
      this.logger.error('Failed to initialize Graph client:', error);
      throw new AuthenticationError(
        `Failed to initialize Microsoft Graph client: ${error.message}`,
        error.errorCode
      );
    }
  }

  /**
   * Get access token for Microsoft Graph
   */
  async getAccessToken(): Promise<string> {
    try {
      const clientCredentialRequest: ClientCredentialRequest = {
        scopes: ["https://graph.microsoft.com/.default"],
      };

      const response: AuthenticationResult | null = 
        await this.clientApp.acquireTokenByClientCredential(clientCredentialRequest);

      if (!response?.accessToken) {
        throw new AuthenticationError('No access token received from Microsoft Graph');
      }

      this.logger.debug('Access token acquired');
      return response.accessToken;
    } catch (error: any) {
      this.logger.error('Token acquisition failed:', error);

      if (error.errorCode === "invalid_client") {
        throw new AuthenticationError(
          'Invalid client credentials. Please verify your clientId, clientSecret, and tenantId',
          error.errorCode
        );
      } else if (error.errorCode === "unauthorized_client") {
        throw new AuthenticationError(
          'Application not authorized. Please check API permissions and admin consent',
          error.errorCode
        );
      }

      throw new AuthenticationError(
        `Authentication failed: ${error.message}`,
        error.errorCode
      );
    }
  }

  /**
   * Test connection to Microsoft Graph
   */
  async testConnection(): Promise<boolean> {
    try {
      this.logger.info('Testing Microsoft Graph connection...');
      const client = await this.getClient();
      await client.api("/me").get();
      this.logger.info('Connection test successful');
      return true;
    } catch (error: any) {
      this.logger.error('Connection test failed:', error);
      return false;
    }
  }
}
