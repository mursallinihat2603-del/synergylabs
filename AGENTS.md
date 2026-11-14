<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## App architecture
- The assistant keeps one account-scoped UIMessage transcript with owner-only RLS; map access stays public, and AI requests validate the bearer token before reading or saving history.
- Compose assistant chat with AI Elements and stream Lovable AI Responses server-side; preserve full message history and explicit cancellation.
- Ground view uses original NASA rover panoramas with source credits in a lazy-loaded deep-zoom viewer; never imply continuous street coverage or synthesize missing photographic detail.
- Keep planner and map in separate layout tracks by default; only an explicit visitor pin action may overlay the planner, and resize the 2D map when its track changes.
- Navigation uses pure Mars bearings and manual simulated waypoints, never Earth GPS; device speech synthesis provides local, no-login spoken directions without billed public AI endpoints.
- Lazy-load the demand-rendered R3F globe behind ClientOnly; 2D and 3D share explorer state and pure Mars coordinate conversions so landmarks, reports and routes stay aligned. The globe wrapper signals data-scene-ready after imagery draws.
- Keep each main view in a TanStack content route and share the explorer shell; navigation must resolve to real pages.
- Dynamically import Leaflet after hydration and override EPSG4326 distance with the Mars radius; Earth Mercator and Earth-distance calculations are not appropriate.
- Keep updateable landmark and hazard data in src/data JSON; scientific imagery comes from verified NASA tiles with a USGS mosaic fallback.
- Use the maintained javascript-astar engine for illustrative grid routing, and label modeled slopes separately from measured scientific data.
- Keep personal field notes in browser storage because the requested product explicitly has local-only favorites and reports without login.
