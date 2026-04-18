import type {
  InsertProcessor,
  Microphone,
  ParallelProcessor,
  PatchConnection,
  PatchEndpoint,
  PatchGraphModel,
  Preamp,
} from '../types/studio';

function buildInsertEndpointId(index: number, suffix: 'in' | 'out'): string {
  return `insert-${index}-${suffix}`;
}

function buildParallelEndpointId(index: number, suffix: 'in' | 'out'): string {
  return `parallel-${index}-${suffix}`;
}

function baseEndpoints(mic: Microphone | null, preamp: Preamp | null): PatchEndpoint[] {
  return [
    // ── Tracking chain ──
    {
      id: 'tie-line-source',
      label: mic ? `${mic.name} output` : 'Mic tie source',
      row_id: 'row-mic-ties',
      component_id: mic?.id,
      kind: 'tie-line',
      domain: 'mic',
      normalled_to: 'preamp-input',
    },
    {
      id: 'preamp-input',
      label: preamp ? `${preamp.name} input` : 'Preamp input',
      row_id: 'row-preamp-in',
      component_id: preamp?.id,
      kind: 'destination',
      domain: 'mic',
    },
    {
      id: 'preamp-output',
      label: preamp ? `${preamp.name} output` : 'Preamp output',
      row_id: 'row-preamp-out',
      component_id: preamp?.id,
      kind: 'source',
      domain: 'line',
      normalled_to: 'aurora-ad-input',
      half_normal: true,
    },
    {
      id: 'aurora-ad-input',
      label: 'Aurora AD input',
      row_id: 'row-aurora-ad-in',
      kind: 'converter',
      domain: 'line',
    },

    // ── Mixing chain ──
    {
      id: 'aurora-da-output',
      label: 'Aurora DA output',
      row_id: 'row-aurora-da-out',
      kind: 'source',
      domain: 'line',
      normalled_to: 'tilt-eq-input',
      half_normal: true,
    },
    {
      id: 'tilt-eq-input',
      label: 'Tilt EQ input',
      row_id: 'row-tilt-in',
      kind: 'destination',
      domain: 'line',
    },
    {
      id: 'tilt-eq-output',
      label: 'Tilt EQ output',
      row_id: 'row-tilt-out',
      kind: 'source',
      domain: 'line',
      normalled_to: 'api-line-input-1',
    },
    {
      id: 'api-line-input-1',
      label: 'API line input',
      row_id: 'row-api-line-in',
      kind: 'destination',
      domain: 'line',
    },

    // ── API channel inserts ──
    {
      id: 'api-insert-send-1',
      label: 'API insert send',
      row_id: 'row-insert-send',
      kind: 'insert-send',
      domain: 'line',
      normalled_to: 'api-insert-return-1',
      half_normal: true,
    },
    {
      id: 'api-insert-return-1',
      label: 'API insert return',
      row_id: 'row-insert-return',
      kind: 'insert-return',
      domain: 'line',
    },

    // ── API Mix A bus ──
    {
      id: 'api-mix-a-bus',
      label: 'API Mix A bus',
      row_id: 'row-api-mix-out',
      kind: 'bus',
      domain: 'line',
    },
    {
      id: 'api-mix-a-insert-send',
      label: 'API Mix A insert send',
      row_id: 'row-insert-send',
      kind: 'insert-send',
      domain: 'line',
      normalled_to: 'api-mix-a-insert-return',
      half_normal: true,
    },
    {
      id: 'api-mix-a-insert-return',
      label: 'API Mix A insert return',
      row_id: 'row-insert-return',
      kind: 'insert-return',
      domain: 'line',
    },

    // ── API Mix B bus ──
    {
      id: 'api-mix-b-bus',
      label: 'API Mix B bus',
      row_id: 'row-api-mix-out',
      kind: 'bus',
      domain: 'line',
    },
    {
      id: 'api-mix-b-insert-send',
      label: 'API Mix B insert send',
      row_id: 'row-insert-send',
      kind: 'insert-send',
      domain: 'line',
      normalled_to: 'api-mix-b-insert-return',
      half_normal: true,
    },
    {
      id: 'api-mix-b-insert-return',
      label: 'API Mix B insert return',
      row_id: 'row-insert-return',
      kind: 'insert-return',
      domain: 'line',
    },

    // ── Pueblo cascade destination ──
    {
      id: 'pueblo-bank-c-input',
      label: 'Pueblo Bank C input',
      row_id: 'row-pueblo-in',
      kind: 'destination',
      domain: 'line',
    },
    {
      id: 'pueblo-bank-d-input',
      label: 'Pueblo Bank D input',
      row_id: 'row-pueblo-in',
      kind: 'destination',
      domain: 'line',
    },

    // ── Print path (patchable, no default normal) ──
    {
      id: 'ad-plus-input',
      label: 'Dangerous AD+ input',
      row_id: 'row-ad-daw',
      kind: 'converter',
      domain: 'line',
    },
    {
      id: 'daw-destination',
      label: 'DAW record path',
      row_id: 'row-ad-daw',
      kind: 'destination',
      domain: 'digital-audio',
    },
  ];
}

function baseConnections(mic: Microphone | null, preamp: Preamp | null): PatchConnection[] {
  const connections: PatchConnection[] = [
    // ── API bus insert normals ──
    {
      id: 'conn-mix-a-send-normal',
      from_endpoint_id: 'api-mix-a-insert-send',
      to_endpoint_id: 'api-mix-a-insert-return',
      mode: 'normalled',
      active: true,
    },
    {
      id: 'conn-mix-b-send-normal',
      from_endpoint_id: 'api-mix-b-insert-send',
      to_endpoint_id: 'api-mix-b-insert-return',
      mode: 'normalled',
      active: true,
    },
    // ── API Mix A → Pueblo Bank C ──
    {
      id: 'conn-mix-a-to-pueblo-c',
      from_endpoint_id: 'api-mix-a-insert-return',
      to_endpoint_id: 'pueblo-bank-c-input',
      mode: 'normalled',
      active: true,
    },
    // ── API Mix B → Pueblo Bank D ──
    {
      id: 'conn-mix-b-to-pueblo-d',
      from_endpoint_id: 'api-mix-b-insert-return',
      to_endpoint_id: 'pueblo-bank-d-input',
      mode: 'normalled',
      active: true,
    },
  ];

  if (mic) {
    connections.push({
      id: 'conn-tie-to-preamp',
      from_endpoint_id: 'tie-line-source',
      to_endpoint_id: 'preamp-input',
      mode: 'normalled',
      active: true,
    });
  }

  if (preamp) {
    connections.push(
      // ── Preamp internal path ──
      {
        id: 'conn-preamp-internal',
        from_endpoint_id: 'preamp-input',
        to_endpoint_id: 'preamp-output',
        mode: 'derived',
        active: true,
      },
      // ── Tracking: preamp → Aurora AD (half-normal) ──
      {
        id: 'conn-preamp-to-aurora',
        from_endpoint_id: 'preamp-output',
        to_endpoint_id: 'aurora-ad-input',
        mode: 'normalled',
        active: true,
      },
      // ── Mixing chain: Tilt → API → insert → bus → Pueblo ──
      {
        id: 'conn-tilt-to-api',
        from_endpoint_id: 'tilt-eq-output',
        to_endpoint_id: 'api-line-input-1',
        mode: 'normalled',
        active: true,
      },
      {
        id: 'conn-api-line-to-send',
        from_endpoint_id: 'api-line-input-1',
        to_endpoint_id: 'api-insert-send-1',
        mode: 'derived',
        active: true,
      },
      {
        id: 'conn-return-to-mix-a',
        from_endpoint_id: 'api-insert-return-1',
        to_endpoint_id: 'api-mix-a-bus',
        mode: 'derived',
        active: true,
      },
      {
        id: 'conn-mix-a-to-send',
        from_endpoint_id: 'api-mix-a-bus',
        to_endpoint_id: 'api-mix-a-insert-send',
        mode: 'derived',
        active: true,
      },
    );
  }

  return connections;
}

export function buildPatchGraph(
  mic: Microphone | null,
  preamp: Preamp | null,
  inserts: InsertProcessor[],
  parallelProcessors: ParallelProcessor[]
): PatchGraphModel {
  const endpoints: PatchEndpoint[] = baseEndpoints(mic, preamp);

  inserts.forEach((insert, index) => {
    endpoints.push(
      {
        id: buildInsertEndpointId(index, 'in'),
        label: `${insert.item.name} input`,
        component_id: insert.item.id,
        kind: 'destination',
        domain: 'line',
      },
      {
        id: buildInsertEndpointId(index, 'out'),
        label: `${insert.item.name} output`,
        component_id: insert.item.id,
        kind: 'source',
        domain: 'line',
      }
    );
  });

  parallelProcessors.forEach((processor, index) => {
    endpoints.push(
      {
        id: buildParallelEndpointId(index, 'in'),
        label: `${processor.item.name} parallel input`,
        component_id: processor.item.id,
        kind: 'destination',
        domain: 'line',
      },
      {
        id: buildParallelEndpointId(index, 'out'),
        label: `${processor.item.name} parallel output`,
        component_id: processor.item.id,
        kind: 'source',
        domain: 'line',
      }
    );
  });

  const connections = baseConnections(mic, preamp);

  if (inserts.length === 0) {
    connections.push({
      id: 'conn-insert-normal',
      from_endpoint_id: 'api-insert-send-1',
      to_endpoint_id: 'api-insert-return-1',
      mode: 'normalled',
      active: true,
    });
  } else {
    connections.push({
      id: 'conn-send-to-first-insert',
      from_endpoint_id: 'api-insert-send-1',
      to_endpoint_id: buildInsertEndpointId(0, 'in'),
      mode: 'patched',
      active: true,
    });

    inserts.forEach((_, index) => {
      if (index < inserts.length - 1) {
        connections.push({
          id: `conn-insert-${index}-to-${index + 1}`,
          from_endpoint_id: buildInsertEndpointId(index, 'out'),
          to_endpoint_id: buildInsertEndpointId(index + 1, 'in'),
          mode: 'patched',
          active: true,
        });
      }
    });

    connections.push({
      id: 'conn-last-insert-to-return',
      from_endpoint_id: buildInsertEndpointId(inserts.length - 1, 'out'),
      to_endpoint_id: 'api-insert-return-1',
      mode: 'patched',
      active: true,
    });
  }

  parallelProcessors.forEach((processor, index) => {
    connections.push(
      {
        id: `conn-parallel-send-${index}`,
        from_endpoint_id: processor.routing.send_source_id,
        to_endpoint_id: buildParallelEndpointId(index, 'in'),
        mode: 'patched',
        active: true,
      },
      {
        id: `conn-parallel-return-${index}`,
        from_endpoint_id: buildParallelEndpointId(index, 'out'),
        to_endpoint_id: processor.routing.return_destination_id,
        mode: 'patched',
        active: true,
      }
    );
  });

  return { endpoints, connections };
}