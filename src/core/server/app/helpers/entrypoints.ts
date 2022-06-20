import { Asset, Manifest } from "./manifestLoader";

/**
 * Entrypoint is the version of the entrypoint that has collected entries with
 * integrity values.
 */
export type Entrypoint = Record<string, Asset[]>;

/**
 * RawEntrypoint is the entrypoint entry generated by the webpack plugin.
 */
export interface RawEntrypoint {
  assets: Record<string, string[]>;
}

/**
 * Entrypoints will parse the manifest provided by the `webpack-assets-manifest`
 * plugin and make their assets available for each entrypoint.
 */
export default class Entrypoints {
  private entrypoints = new Map<string, Entrypoint>();

  constructor(manifest: Manifest) {
    for (const entry in manifest.entrypoints) {
      if (!Object.prototype.hasOwnProperty.call(manifest.entrypoints, entry)) {
        continue;
      }

      // Grab the entrypoint that contains the list of all the assets
      // for this entrypoint.
      const entrypoint: Entrypoint = {};

      // Itterate over the extension's in the entrypoint.
      for (const extension in manifest.entrypoints[entry].assets) {
        if (
          !Object.prototype.hasOwnProperty.call(
            manifest.entrypoints[entry].assets,
            extension
          )
        ) {
          continue;
        }

        // Create the extension in the entrypoint.
        entrypoint[extension] = [];

        // Grab the files in the extension.
        const assets = manifest.entrypoints[entry].assets[extension];

        // Iterate over the src field for each of the files.
        for (const src of assets) {
          let integrity = "";
          // Search for the entry with intgrity in the assets.
          for (const name in manifest) {
            if (
              name !== "entrypoints" &&
              !Object.prototype.hasOwnProperty.call(manifest, name)
            ) {
              continue;
            }

            // Grab the asset.
            const asset = manifest[name];

            // Check to see if the asset is a match.
            if (asset.src === src) {
              integrity = asset.integrity;
              break;
            }
          }

          entrypoint[extension].push({ src, integrity });
        }

        this.entrypoints.set(entry, entrypoint);
      }
    }
  }

  public get(name: string): Readonly<Entrypoint> {
    const entrypoint = this.entrypoints.get(name);
    if (!entrypoint) {
      throw new Error(`Entrypoint ${name} does not exist in the manifest`);
    }

    return entrypoint;
  }
}
