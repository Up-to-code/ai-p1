# @anan/location-map

Reusable Mapbox-backed location primitives for Anan workspace lifecycle screens.

- `LocationValue`: serializable selected point data.
- `LocationPicker`: client search + selected point preview.
- `LocationPreview`: read-only static Mapbox map preview.

The package reads `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` from the host app. Do not hardcode public tokens in source files.
