#!/usr/bin/env node

/**
 * Re-compress the hero GLB WITHOUT Draco compression.
 * Uses meshopt only — pure JS decoder, no WASM, works on all devices.
 *
 * Usage:
 *   node scripts/recompress-glb.mjs public/models/madam_herta.glb
 *
 * Reads the (possibly Draco-compressed) input, strips Draco, applies
 * meshopt quantization, and overwrites in-place.
 */

import { copyFileSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, resample, textureCompress, weld } from "@gltf-transform/functions";
import draco3d from "draco3d";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/recompress-glb.mjs <path-to.glb>");
  process.exit(1);
}

const inputPath = resolve(input);
const outputPath = inputPath; // overwrite in-place
const backupPath = inputPath.replace(/\.glb$/i, ".draco-backup.glb");

// Backup original Draco-compressed version
copyFileSync(inputPath, backupPath);
console.log(`Backup: ${basename(backupPath)}`);

const before = statSync(inputPath).size / (1024 * 1024);
console.log(`Input:  ${basename(inputPath)}  (${before.toFixed(2)} MB)`);

await MeshoptEncoder.ready;

// Need Draco decoder to READ the Draco-compressed input file,
// but we won't write Draco back out.
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "draco3d.decoder": await draco3d.createDecoderModule(),
  "draco3d.encoder": await draco3d.createEncoderModule(),
  "meshopt.encoder": MeshoptEncoder,
  "meshopt.decoder": MeshoptDecoder,
});

const document = await io.read(inputPath);

// Strip Draco extension from the document root
const root = document.getRoot();
const used = root.listExtensionsUsed();
for (const ext of used) {
  if (ext.extensionName === "KHR_draco_mesh_compression") {
    console.log("Disposing KHR_draco_mesh_compression");
    ext.dispose();
  }
}

await document.transform(
  // Remove unused nodes, duplicate data
  prune(),
  dedup(),
  // Merge coincident vertices
  weld({ tolerance: 0.0001 }),
  // Resample animation keyframes
  resample(),
  // Downscale + re-encode textures to WebP
  textureCompress({
    encoder: sharp,
    targetFormat: "webp",
    resize: [1024, 1024],
    quality: 78,
  }),
  // Meshopt quantization — pure JS decode, near-universal support
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  // NO draco() — this is the whole point. No WASM needed at runtime.
);

await io.write(outputPath, document);

const after = statSync(outputPath).size / (1024 * 1024);
const ratio = ((1 - after / before) * 100).toFixed(1);
console.log(`Output: ${basename(outputPath)}  (${after.toFixed(2)} MB)`);
console.log(`Saved:  ${ratio}% smaller`);
console.log(`\n✅ Model re-compressed with meshopt only (no Draco/WASM dependency)`);
console.log(`   Backup saved to: ${basename(backupPath)}`);
