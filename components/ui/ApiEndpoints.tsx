import { ChevronDown, ExternalLink } from 'lucide-react';
import type { ApiLink, EndpointAuth, EndpointParameter, ParameterLocation } from '@/lib/types';

/**
 * The endpoints this screen talks to, and the variables they expect.
 *
 * Every value in here is a path, a method, a parameter name or a type, so the
 * whole panel is mono — the same rule the tables use. It is collapsed by
 * default because it answers a question you have occasionally and not one you
 * have while editing a record; `<details>` rather than state, so it needs no
 * JavaScript and keeps working in a server component.
 *
 * Renders nothing when there is no catalogue. A screen must not grow an empty
 * box because the API was unreachable.
 */

const AUTH_LABEL: Record<EndpointAuth, string> = {
  public: 'Public',
  admin: 'Admin token',
  api_key: 'API key',
  admin_or_api_key: 'Admin token or API key',
};

const LOCATION_LABEL: Record<ParameterLocation, string> = {
  path: 'Path',
  query: 'Query',
  header: 'Header',
  body: 'Body',
};

const LOCATION_ORDER: ParameterLocation[] = ['path', 'query', 'body', 'header'];

export function ApiEndpoints({ link }: { link: ApiLink | null }) {
  if (!link || link.endpoints.length === 0) return null;

  return (
    <details className="api-panel">
      <summary className="flex cursor-pointer items-center gap-3">
        <span className="api-panel-label">API</span>
        <span className="api-panel-path truncate">{link.basePath}</span>
        <span className="api-panel-count ml-auto">
          {link.endpoints.length} endpoint{link.endpoints.length === 1 ? '' : 's'}
        </span>
        <ChevronDown className="api-panel-chevron h-4 w-4 flex-none" aria-hidden="true" />
      </summary>

      <div className="api-panel-body">
        <p className="text-fg-muted text-label">
          {link.description} Base URL <span className="font-mono">{link.url}</span>.
        </p>

        <div className="mt-4">
          {link.endpoints.map((endpoint) => (
            <div className="endpoint-row" key={`${endpoint.method} ${endpoint.path}`}>
              <span className="endpoint-method">{endpoint.method}</span>
              <span className="endpoint-path">{endpoint.path}</span>
              <span className="endpoint-auth">{AUTH_LABEL[endpoint.auth]}</span>
              {endpoint.summary && <span className="endpoint-summary">{endpoint.summary}</span>}
              <Parameters parameters={endpoint.parameters} />
            </div>
          ))}
        </div>

        {link.docsUrl && (
          <a
            className="text-label mt-4 inline-flex items-center gap-1.5"
            href={link.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open the reference
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </div>
    </details>
  );
}

/**
 * The variables, grouped by where they go.
 *
 * Grouped rather than listed flat because "what does it expect" is really four
 * questions — what is in the path, what can I filter by, what do I send, what
 * do I have to set as a header — and a single row of thirty chips answers none
 * of them. A required one carries the same emerald asterisk a required form
 * field does, so the mark means one thing across the whole app.
 */
function Parameters({ parameters }: { parameters: EndpointParameter[] }) {
  if (parameters.length === 0) return null;

  return (
    <div className="endpoint-params">
      {LOCATION_ORDER.map((location) => {
        const inLocation = parameters.filter((parameter) => parameter.location === location);
        if (inLocation.length === 0) return null;

        return (
          <div className="endpoint-param-group" key={location}>
            <span className="endpoint-param-label">{LOCATION_LABEL[location]}</span>
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {inLocation.map((parameter) => (
                <span
                  className="endpoint-param"
                  key={parameter.name}
                  title={parameter.description ?? undefined}
                >
                  {parameter.name}
                  <span className="endpoint-param-type">{parameter.type}</span>
                  {parameter.required && (
                    <span className="req text-brand" aria-label="required">
                      *
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Every group the API publishes, as an index.
 *
 * The per-screen panel answers "what does *this* screen use". This answers
 * "what is there", which is a dashboard question — and it is also the fastest
 * way to see which API this admin is actually pointed at, because the base URL
 * is the one the response was served from rather than one written down here.
 */
export function ApiCatalogue({ links }: { links: ApiLink[] }) {
  if (links.length === 0) return null;

  const base = new URL(links[0].url).origin;

  return (
    <div className="api-catalogue">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-fg-muted text-small font-mono">API</p>
        <p className="text-fg-muted text-label font-mono">{base}</p>
      </div>

      <ul className="api-catalogue-list">
        {links.map((link) => (
          <li key={link.key}>
            {link.docsUrl ? (
              <a href={link.docsUrl} target="_blank" rel="noopener noreferrer">
                <span className="api-catalogue-path">{link.basePath}</span>
                <span className="api-catalogue-label">{link.label}</span>
                <span className="api-catalogue-count">{link.endpoints.length}</span>
              </a>
            ) : (
              <span>
                <span className="api-catalogue-path">{link.basePath}</span>
                <span className="api-catalogue-label">{link.label}</span>
                <span className="api-catalogue-count">{link.endpoints.length}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
