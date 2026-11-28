# Animation guidelines

Stage the reveal in three beats: silhouette, reflected body line, then a settled inspection view. Use a GSAP timeline to coordinate these beats and a single camera owner at a time. Skip should land at the same usable endpoint as natural completion. Release the camera to visitor controls when the reveal ends.

Keep native scrolling. In Phase 5 map section progress to reversible camera positions using ScrollTrigger. Verify reverse travel, resizing and leaving mid-transition. Scope animations to their React component and revert timelines, listeners and triggers on unmount so revisiting the showroom cannot double the effect.

Use transforms and opacity for interface transitions. Start with 160–240 ms for selection feedback. Avoid animating layout on every frame. With reduced motion enabled, show the settled composition immediately, disable camera travel and pinning, and retain all content in reading order. Test switching the preference while the page is open.

## Phase 4 hero

The HTML entrance starts immediately. The eyebrow rises over 320 ms. The title begins at 60 ms and settles at 740 ms. The description and studio link enter from 180 ms, 80 ms apart. Controls remain in the document flow and usable throughout.

The first rendered vehicle frame starts a separate 1.45 s eased camera move. Framing projects the vehicle bounds at the current angle and aspect ratio throughout the move. Reflected studio light rises from 0.42 to 0.95. The tween requests a scene frame on updates. Completion, skip or reduced motion leaves the camera in its inspection pose. Context loss and teardown kill active scene motion.
