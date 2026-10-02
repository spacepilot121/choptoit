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
