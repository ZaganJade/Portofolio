#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3d";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/inspect-glb.mjs <path.glb>");
  process.exit(1);
}

await MeshoptEncoder.ready;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "draco3d.encoder": await draco3d.createEncoderModule(),
  "draco3d.decoder": await draco3d.createDecoderModule(),
  "meshopt.encoder": MeshoptEncoder,
  "meshopt.decoder": MeshoptDecoder,
});

const doc = await io.read(resolve(input));
const root = doc.getRoot();

// Dump every joint from every skin + every mesh to a JSON file.
const report = {
  skins: root.listSkins().map((skin, i) => ({
    index: i,
    name: skin.getName(),
    jointCount: skin.listJoints().length,
    joints: skin.listJoints().map((j, idx) => ({ idx, name: j.getName() })),
  })),
  meshes: root.listMeshes().map((m, i) => ({
    index: i,
    name: m.getName(),
    primitiveCount: m.listPrimitives().length,
  })),
  nodes: root.listNodes().map((n) => n.getName()),
  animations: root.listAnimations().map((a) => a.getName()),
};

const out = resolve("scripts/skeleton-report.json");
writeFileSync(out, JSON.stringify(report, null, 2), "utf8");
console.log(`Wrote ${out}`);
console.log(`Skins: ${report.skins.length}`);
console.log(`Animations: ${report.animations.length}`);
console.log(`Joints per skin:`, report.skins.map((s) => s.jointCount).join(", "));
