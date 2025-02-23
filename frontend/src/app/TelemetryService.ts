import {
  ApplicationInsights,
  SeverityLevel,
} from "@microsoft/applicationinsights-web";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";

let reactPlugin: ReactPlugin | null = null;
let appInsights: ApplicationInsights | null = null;

const createTelemetryService = () => {
  const initialize = () => {
    const connectionString =
      process.env.REACT_APP_APPLICATIONINSIGHTS_CONNECTION_STRING;

    if (!connectionString) {
      if (process.env.NODE_ENV !== "test") {
        console.warn("App Insights connection string not provided");
      }
      return;
    }

    reactPlugin = new ReactPlugin();

    appInsights = new ApplicationInsights({
      config: {
        connectionString,
        extensions: [reactPlugin],
        loggingLevelConsole: process.env.NODE_ENV === "development" ? 2 : 0,
        disableFetchTracking: false,
        enableAutoRouteTracking: true,
        loggingLevelTelemetry: 2,
        maxBatchInterval: 0,
      },
    });

    appInsights.loadAppInsights();
  };

  return { reactPlugin, appInsights, initialize };
};

export const ai = createTelemetryService();
export const getAppInsights = () => appInsights;

const logSeverityMap = {
  log: SeverityLevel.Information,
  warn: SeverityLevel.Warning,
  error: SeverityLevel.Error,
  info: SeverityLevel.Information,
} as const;

export function withInsights(console: Console) {
  const originalConsole = { ...console };

  Object.entries(logSeverityMap).forEach((el) => {
    const [method, severityLevel] = el as [
      keyof typeof logSeverityMap,
      SeverityLevel
    ];

    console[method] = (...data: any[]) => {
      originalConsole[method](...data);

      if (method === "error" || method === "warn") {
        const exception = data[0] instanceof Error ? data[0] : undefined;
        const id = (() => {
          if (exception) {
            return exception.message;
          }
          if (typeof data[0] === "string") {
            return data[0];
          }
          return JSON.stringify(data[0]);
        })();

        appInsights?.trackException({
          exception,
          id,
          severityLevel,
          properties: {
            additionalInformation:
              data.length === 1 ? undefined : JSON.stringify(data.slice(1)),
          },
        });

        return;
      }

      const message =
        typeof data[0] === "string" ? data[0] : JSON.stringify(data[0]);

      appInsights?.trackEvent({
        name: `${method.toUpperCase()} - ${message}`,
        properties: {
          severityLevel,
          message,
          additionalInformation:
            data.length === 1 ? undefined : JSON.stringify(data.slice(1)),
        },
      });
    };
  });
}

export function getAppInsightsHeaders(): { [key: string]: string } {
  // x-ms-session-id is passed explicitly to the backend so we can correlate
  // backend operations with the frontend ones in App Insights
  return {
    "x-ms-session-id": getAppInsightsSessionId(),
  };
}

function getAppInsightsSessionId(): string {
  return appInsights?.context.sessionManager.automaticSession.id ?? "";
}
