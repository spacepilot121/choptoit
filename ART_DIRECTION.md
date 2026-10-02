# Angular art and performance direction

The 2 October revision follows the owner's requested flat, angular, comic direction. These are original vector drawings, with editable SVG masters and generated PNG atlases. Run `node scripts/angular-art.cjs` to reproduce them.

- Sixteen heads combine with twelve costumes. Each head has worried, startled and dazed expressions. Customers enter with subtle head movement and breathing; the larger hooded executioner remains dominant.
- Comic ketchup uses angular particles. Its pool starts at the bottom edge and grows with successful chops. Heads retain their dazed expressions, stop after landing, and stack within their landing columns. Changing town clears the pile.
- Two cloud silhouettes vary in scale and move at different speeds, behind and in front of transparent town scenery. All fifteen towns and the road use the same flat geometry.
- Travel plays an accelerated journey. Route days set its duration; the sky cycles, the date advances, and arrival updates the saved calendar once. App suspension pauses the journey.
- Caravan storage level 1 shows the executioner and dog; level 2 adds a pack horse; level 3 adds a cart. Further upgrades enlarge the cart. Walking legs, rolling wheels and a gentle bob give the procession movement.
- York introduces ordinary targets. Durham introduces shields; Chester and port towns add barrels; Canterbury, Lincoln and Winchester add monks; London, Oxford and Gloucester add royal targets. Blade level 8 enables London's high poles, Norwich's floating green and Winchester's thrown ring.
- Chop streaks display an arcade banner from three chops. Multiple rewarding targets hit by the same head add escalating coin bonuses capped at five per extra target, with their own banner. Repeated collision checks cannot pay twice.
- Portrait controls leave a visible foreground shelf for the pile. Short-height layouts retain a usable shot button.

Release ea4bff74b56b387e passes the release checks and native content sync (64 upload files, approximately 3.4 MB). Browser checks covered 390 by 844 and 320 by 520, and an eight-day journey arrived in Winchester. Another journey arrived in Norwich without new console errors. Visual checks used an upgraded save fixture; they do not establish balance or earned progression. Long-session pile visibility, live special-event hits, the complete revised campaign and physical-phone touch/performance still require playtesting.

## Added depth and movement - 2 October feedback

Release 58146f8ade76bebe adds light and shadow facets, layered hair, cheeks, collars, belts, embroidery, armour and boots. The executioner is narrower with a faceted hood and leather fittings. Jesters wear compact caps rather than spiked triangles. The head atlas now has 64 frames, including happy escape expressions. Entrances and departures have walking sway; three misses trigger a smiling, bouncing run.

Town quarters now have timber braces, roof facets, masonry, windows and cobbles, with architectural families assigned to the actual towns: ports have ships, cathedral towns have spires, fortified towns have walls and Oxford has a college tower. Animated residents, banners and chimney smoke add background activity. Existing clouds remain. Stars span the sky; sun and moon follow paths from outside one edge to beyond the other, with a continuous moon path at midnight and a lower arc that clears the portrait HUD.

Weapons have five different silhouettes across six material/decorative tiers. Caravan progression adds cargo at storage four, a canopy at six, a lantern at nine and a pennant at twelve, alongside rolling wheels, moving horse and dog tails, walking legs and parallax roadside trees and road markings. Workshop cart artwork has matching detail.

The brass pointer and a continuous flight ribbon replace the solid yellow triangle and dotted preview. The parchment contract and brass controls add warmth to the HUD. Wind uses shaped leaves with veins and shows a direction arrow. Rain retains its added falling gravity and fog originally used drifting mist and fading targets; the later correction below removes target fading. Winter snow uses snowflakes and adds 120 falling acceleration versus rain's 300; the preview uses the same effects. Full checks, packaged HTTP verification and native sync pass. Physical-phone feel and a complete revised campaign remain open.

## Grounding and city revision — 2 October

The executioner grips the shaft with both hands. Shoulder/elbow poses follow the axe through anticipation, forward stroke and recovery; the chop callback fires once at impact. Prisoners, escorts and jester carriers meet the stage at y=1080. Residents walk on a separate visible street at y=1050, behind the stage. Shot controls anchor below the stage rather than covering their feet. On short screens the button itself names the current step, freeing space for the foreground pile.

Heads and bodies settle into retained landing columns above the navigation, with ketchup growing from that same floor. Resizing repositions existing remains. Changing city intentionally clears the pile. Fog consists of large drifting foreground wisps; cast opacity no longer oscillates. Ordinary targets, shields, barrels and royal medals have shadow facets. Stars use irregular random positions.

Travel uses a horizontal dirt track, varied broadleaf/conifer silhouettes, and occasional passing travellers, birds or running deer. The executioner, dog, horse and cart share the track. Route duration and calendar accounting are unchanged. These are stylised medieval scenes, not scale reconstructions. Landmark choices use primary heritage/tourism references:

| City | Landmark cue | Reference |
| --- | --- | --- |
| York | Minster, square central and west towers | [York Minster](https://yorkminster.org/discover/interactive-map/) |
| Canterbury | Bell Harry and west towers | [Cathedral architecture](https://www.canterbury-cathedral.org/visit/what-will-you-discover/architecture/) |
| Durham | Norman nave and three towers | [Central tower](https://www.durhamcathedral.co.uk/explore/the-cathedral-building-and-grounds/the-central-tower) |
| Winchester | Long nave and lower Norman tower | [Cathedral architecture](https://www.winchester-cathedral.org.uk/history/architecture/) |
| Lincoln | Three cathedral towers | [Cathedral pinnacles](https://lincolncathedral.com/latest-news/lincoln-cathedral-awarded-38000-pinnacles/) |
| Gloucester | Tall central cathedral tower | [Cathedral architecture](https://gloucestercathedral.org.uk/cathedral/heritage/architecture) |
| London | White Tower keep and turrets | [Historic Royal Palaces](https://www.hrp.org.uk/tower-of-london/whats-on/white-tower/) |
| Dover | Great Tower, chalk cliffs and harbour | [English Heritage](https://www.english-heritage.org.uk/dover) |
| Norwich | Cathedral spire and castle | [Visit Norwich](https://www.visitnorwich.co.uk/visiting-norwich/) |
| Chester | Red sandstone walls and gateway | [Medieval Chester](https://www.visitcheshire.com/dbimgs/Medieval%20Chester.pdf) |
| Hull | Minster beside the port | [Hull Minster heritage](https://hullminster.org/heritage-tours-talks-trails) |
| Newcastle | Norman keep and riverside | [Castle history](https://www.newcastlecastle.co.uk/castle-history) |
| Colchester | Broad Norman keep | [Norman and medieval Colchester](https://www.visitcolchester.com/explore/colchesters-history/norman-and-medieval-colchester/) |
| Oxford | College courts and cathedral spire | [Christ Church](https://www.chch.ox.ac.uk/visit/things-to-see) |
| Southampton | Bargate and harbour | [City history](https://www.visitsouthampton.co.uk/explore/history/) |
