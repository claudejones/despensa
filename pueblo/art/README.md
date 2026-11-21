# Pueblo art

## Test of the image tool (2026-11-21)

- Tool: the session's ChatGPT ImageGen connector, model `gpt-image-2.5-flare`, quality medium, transparent background. Two images: one vendor portrait (1024x1024), one sheet of four produce items (1536x512).
- Result: the look is right, but the raw output is not true pixel art. Cells are uneven and edges carry a soft semi-transparent halo.
- Clean-up that works: hard alpha threshold, downsample by 8 (median per cell), quantise to a small palette, crop. `tools/clean.py` does one image; `tools/cut.py` cuts a sheet into items by alpha gaps and gives each its own palette.
- Sizes after clean-up: vendor 111x116, 8.7 KB; produce items about 30 to 40 px, 0.8 to 1.5 KB each.
- Lesson: quantise each item on its own. One shared palette across a sheet turned the tomato brown.
- Town scene for the title: one 1536x1024 image, cleaned to 192x128, 10 KB. No text appeared in it.
- Not yet tested: holding one character across several expressions (edit from a master image), and cost per image.
- `test/` holds the cleaned sprites. They are throwaway test art, used on the first screens to judge pixels beside Material controls.

Style prefix used: "32-bit era console pixel art, crisp square pixels on one uniform grid, limited palette, one-pixel dark outline in near-black ink #1F1B16, flat cel shading with 2 to 3 tones per colour, no gradients, no anti-aliasing blur, no glow, light from the upper left. Clean silhouette, no text, no watermark, no modern logos. Original design."
