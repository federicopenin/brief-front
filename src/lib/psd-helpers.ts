import type { PsdLayer, FlatLayer } from "@/types";

export function flattenLayers(layers: PsdLayer[], depth = 0): FlatLayer[] {
  let result: FlatLayer[] = [];

  layers.forEach((layer) => {
    if (layer.type !== "group") {
      result.push({
        id: layer.id,
        name: layer.name,
        safeName: layer.safeName,
        type: layer.type as FlatLayer["type"],
        depth: depth,
      });
    }

    if (layer.children && layer.children.length > 0) {
      result = [...result, ...flattenLayers(layer.children, depth + 1)];
    }
  });

  return result;
}
