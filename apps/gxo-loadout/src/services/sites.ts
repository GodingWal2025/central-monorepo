// Sites service.
//
// Sites are now managed centrally in the Operations Hub app and shared via the
// ontology API. This module is a thin async adapter that maps the ontology
// SiteObject into the local Site shape the Loadout UI expects.

import { ontologyClient } from '@gxo/semantic';
import type { Site, SiteObject } from '@gxo/semantic';

function toSite(o: SiteObject): Site {
  return {
    id: o.id,
    name: o.properties.name,
    address: o.properties.address || undefined,
    active: o.properties.active,
    createdAt: o.properties.createdAt,
  };
}

export async function fetchActiveSites(): Promise<Site[]> {
  const objs = await ontologyClient.getSites();
  return objs
    .filter((o) => o.properties.active)
    .map(toSite)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Convenience for onboarding — creates a site in the shared ontology. */
export async function createSite(name: string, address?: string): Promise<Site> {
  const created: any = await ontologyClient.createSite({
    name: name.trim(),
    address: address?.trim() || undefined,
  });
  // The API returns the flat Prisma row (not a SiteObject).
  return {
    id: created.id,
    name: created.name,
    address: created.address || undefined,
    active: created.active ?? true,
    createdAt: created.createdAt,
  };
}
