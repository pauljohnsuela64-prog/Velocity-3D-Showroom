# Animation guidelines

Stage the reveal in three beats: silhouette, reflected body line, then a settled inspection view. Use a GSAP timeline to coordinate these beats and a single camera owner at a time. Skip should land at the same usable endpoint as natural completion. Release the camera to visitor controls when the reveal ends.

Keep native scrolling. In Phase 5 map section progress to reversible camera positions using ScrollTrigger. Verify reverse travel, resizing and leaving mid-transition. Scope animations to their React component and revert timelines, listeners and triggers on unmount so revisiting the showroom cannot double the effect.

Use transforms and opacity for interface transitions. Start with 160–240 ms for selection feedback. Avoid animating layout on every frame. With reduced motion enabled, show the settled composition immediately, disable camera travel and pinning, and retain all content in reading order. Test switching the preference while the page is open.
