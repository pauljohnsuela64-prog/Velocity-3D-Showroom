# Asset licenses

The asset register starts empty in Phase 0. The repository's [MIT license](../LICENSE) covers its software and associated documentation. Check each model, texture, environment map, still, font, sound and depicted brand separately.

Phase 2 uses operating-system fonts and original CSS for the wordmark and studio surface. The build distributes no font files or third-party visual assets.

Before import, record a row with the actual source and retain a dated copy of the permission evidence. Check modification, redistribution in a downloadable web build, commercial display and photography-mode export. Record attribution exactly as required and where visitors will see it. Hold assets with missing or ambiguous rights outside the build until cleared. Verify marks and vehicle likeness rights separately from the mesh license.

| Asset and local path | Creator and source URL | License/version and dated evidence | Permitted uses and restrictions | Required credit and placement | Reviewer/status |
| --- | --- | --- | --- | --- | --- |

## Phase 3 vehicle clearance (2026-11-27)

The 26,624-byte fallback at `public/models/vehicle.webp` is a Chromium render of the adapted vehicle under the project's studio lighting. The same model attribution and license notice are available beside both views. The final adaptation removes non-lamp emission left behind by the original emissive textures and adjusts metal response on the rims, brakes and discs.

| Asset and local path | Creator and source | License evidence | Use and restrictions | Credit | Review |
| --- | --- | --- | --- | --- | --- |
| Car Concept derivative, `public/models/vehicle.glb` | Eric Chadwick, Darmstadt Graphics Group GmbH, based on Unity Fan’s public-domain concept | [Publisher metadata](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/CarConcept/metadata.json), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Commercial display, modification and redistribution with attribution, license link and change notice. Preserve attribution with future photo exports. | [Distributed notice](../public/models/CREDITS.txt), linked from the showroom | Cleared for the documented derivative |

The upstream GLB was 11,778,688 bytes, SHA-256 `c272098089d78c5cd9fd9f24ff50ee8acf8d932c55f2d55fc10adb6c8998966b`. Its license plate and texture artwork include separately controlled marks. The adaptation removes all source images and the plate and steering emblem geometry. The fictional concept has no claimed relationship to a vehicle manufacturer. The source credits Khronos and 3D Commerce marks separately. [Publisher model history](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept) and [trademark notice](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/LICENSES/LicenseRef-LegalMark-Khronos.txt).

The distributed GLB is 6,754,016 bytes (6.75 MB), SHA-256 `bc8a59f3a0d5e88239021a7afe6570569c01e7f25207b2954960d63bd8df1a52`. It contains 95 meshes, 213,195 instanced triangles in the scene and 22 materials. It uses standard metallic-roughness materials, alpha-blended glass and clearcoat. Geometry preserves the upstream positions and normals. Removing the textures eliminates baked occlusion, tire tread and paint microflake detail. No image downloads or geometry decoders are required. The packaged root transform puts the front along +X, uses +Y for height and scales the car to 4.5 m in length. [Dated publisher evidence](licenses/CarConcept-2026-11-27.json)
