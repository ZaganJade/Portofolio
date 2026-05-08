#!/usr/bin/env node

/**
 * Compress the hero GLB with Draco + Meshopt + texture optimization.
 * Run once when you change the source model:
 *   node scripts/compress-glb.mjs public/models/madam_herta.glb
 */

import { statSync } from "node:fs";
import { basename, resolve } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  draco,
  meshopt,
  prune,
  resample,
  textureCompress,
  weld,
} from "@gltf-transform/functions";
import draco3d from "draco3d";
import { MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/compress-glb.mjs <path-to.glb>");
  process.exit(1);
}

const inputPath = resolve(input);
const outputPath = inputPath.replace(/\.glb$/i, ".opt.glb");

const before = statSync(inputPath).size / (1024 * 1024);
console.log(`Input:  ${basename(inputPath)}  (${before.toFixed(1)} MB)`);

await MeshoptEncoder.ready;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "draco3d.encoder": await draco3d.createEncoderModule(),
  "draco3d.decoder": await draco3d.createDecoderModule(),
  "meshopt.encoder": MeshoptEncoder,
});

const document = await io.read(inputPath);

await document.transform(
  // Remove unused nodes, duplicate data, etc.
  prune(),
  dedup(),
  // Merge vertex attributes by welding coincident vertices
  weld({ tolerance: 0.0001 }),
  // Compress keyframe animation data (no-op if there aren't any)
  resample(),
  // Downscale + re-encode textures to WebP (keeps transparency)
  textureCompress({
    encoder: sharp,
    targetFormat: "webp",
    resize: [1024, 1024],
    quality: 78,
  }),
  // Meshopt quantization (cheap to decode, good ratio)
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  // Draco mesh compression (best ratio, slight decode cost)
  draco({ method: "edgebreaker", quantizePosition: 14, quantizeNormal: 10 }),
);

await io.write(outputPath, document);

const after = statSync(outputPath).size / (1024 * 1024);
const ratio = ((1 - after / before) * 100).toFixed(1);
console.log(`Output: ${basename(outputPath)}  (${after.toFixed(1)} MB)`);
console.log(`Saved:  ${ratio}% smaller`);
