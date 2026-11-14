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
- Select device navigation voices by the chosen language and block unmatched fallback; missing voices keep written guidance available.
- Play bundled generated Azerbaijani maneuver recordings so public navigation speaks without installed voices or billed public AI endpoints; retain dynamic distances as written guidance.
- Keep rover driving in a lazy-loaded client-only R3F scene with Rapier collisions and Mars gravity; label the terrain as simulated and retain real photographic Street view separately.
- Render planner vehicle choices through VehicleAppearance with distinct illustrative astronaut, enclosed-cabin and cargo silhouettes; shared driving physics and suspension remain independent of appearance.
- Keep driving challenge rules and compressed route projection in pure rover-challenges helpers; render telemetry separately so status updates do not rebuild the Canvas. Terrain and route use the same height sampler.
- Detect driving arrival against the compressed route endpoint, latch it in telemetry until recenter or route change, and render the message through the shared language context.
- Keep rover arrival speech opt-in with local volume controls; reuse bundled Azerbaijani arrival audio and matched device voices for other languages, never public billed speech endpoints.
- Keep vehicle handling constants in vehicle-physics; apply bounded horizontal impulses to Rapier bodies for momentum and preserve terrain tilt while applying manual yaw for reliable A/D steering with the suspension controller.
- Use dev-only window.__rover.state(), teleport(x,z), and sim(seconds,boost) to reproduce terrain and battery conditions; data-scene-ready, data-surface, data-battery and data-integrity expose live browser checks without production debug access.
- Localize interface and reference data through the shared language provider; persist language locally after hydration and keep scientific identifiers and user-written content unchanged.
- Pan the photographic panorama with held physical WASD keys using frame-based viewport offsets; clean up keyboard handlers and never imply geographic travel.
- Keep interface motion in global CSS, respect reduced-motion preferences, and never animate map containers or alter camera state for decoration.
- Ground assistant replies in validated explorer context and an isolated server prompt; preserve model and streaming behavior when improving answer quality.
- Group secondary map settings in accessible popovers and keep primary page navigation in the shared header (bottom navigation on phones) so controls do not compete with terrain or planner space.
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
