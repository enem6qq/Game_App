import { useRouter } from 'expo-router';
import React from 'react';

import { ExploreWorld } from '@/features/game/graphics/ExploreWorld';

/** Vollbild-Route für den Erkundungsmodus. */
export default function ExploreScreen() {
  const router = useRouter();
  return <ExploreWorld onClose={() => router.back()} />;
}
