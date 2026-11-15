# Sharing, scientific route planning and classroom exploration

## What to build

### 1. Share a landmark or route
- Add a Share action that copies a link or opens the device’s sharing menu.
- Restore the selected landmark, 2D/3D view, imagery layer, route endpoints, vehicle and planning settings when someone opens it.
- Share only explicit map/route settings; never include account information, chat history or personal hazard reports.
- Add a compact homework sheet with route metrics, source credits and data limitations, using the browser’s Print / Save as PDF dialog.

### 2. Upgrade route planning with measured elevations
- Use a verified numeric NASA/USGS MOLA elevation product, not colors from the existing hillshade imagery.
- Sample elevations and calculate slope with Mars surface distances. Show data resolution and distinguish along-route slope from surrounding terrain steepness.
- Keep the existing vehicle choices and add an editable maximum slope for each trip, clearly identified as a classroom planning setting rather than certified rover capability.
- Make slope-aware planning seek a route within the chosen limit and mark any remaining exceedances. Never label a route operationally safe.
- Show an explicit unavailable state when measured elevation data cannot be obtained; an illustrative fallback must remain clearly labeled and cannot pass a measured-slope check.
- Reuse the measured elevation sampler for drawn-line profiles where coverage allows.

### 3. Compare with NASA rover traverses
- Add independently selectable Curiosity and Perseverance path overlays in both map views.
- Use verified published tracks with mission names, source links, coverage dates and distinct line styles.
- Frame the selected traverse so local rover movements remain visible; never substitute invented paths for NASA tracks.

### 4. Guided classroom missions
- Add a dedicated Missions page with a few defined start points and destinations, including a Jezero delta exploration challenge.
- Include hints, vehicle/slope choices, clear objectives and a visible scoring breakdown based on distance, slope-limit compliance and task completion.
- Preserve progress locally and allow sharing/exporting the result.
- Keep scores educational, not safety certifications. No payments or teacher account system in this update.

### 5. Inspect and collect Martian rock replicas
- Add a small set of collectible specimens in rover driving with documented Mars rock names and shapes based on NASA references.
- Let visitors inspect a nearby specimen, rotate its detailed replica, read its mission/site and geology, and collect it into a locally saved notebook.
- Present NASA reference photography alongside the replica where available, with source credits.
- Clearly label the 3D rocks as reference-based replicas, not exact scans or real samples; generic terrain obstacles remain separate.
- Pause driving during inspection and preserve suspension, battery rules and existing controls.

## Data verification and scope
Numeric MOLA access, rover traverse downloads and rock references are being checked. Only verified scientific sources will be labeled real. If a source lacks usable data or sufficient local resolution, show that limitation instead of inventing measurements, tracks or specimen geometry.

## Technical approach
- Keep sharing validation, slope calculations, mission scoring and collection eligibility in small pure helpers with concrete rule tests.
- Use bounded, validated public server functions for scientific data access where necessary; no user accounts are required for exploration.
- Separate mission and inspection interfaces from the map and driving scenes; reuse the shared language provider and design tokens.
- Add English, Russian and Azerbaijani labels and route-specific page metadata.

## Verification
- Open a shared route in a fresh browser and verify settings and geometry restore without private data.
- Check slope calculations against known numeric fixtures and test above-limit warnings and missing-data behavior.
- Verify both rover track overlays, classroom scoring, rock inspection and collection persistence.
- Check desktop and phone layouts, existing route navigation and rover driving controls, and the homework print layout.
