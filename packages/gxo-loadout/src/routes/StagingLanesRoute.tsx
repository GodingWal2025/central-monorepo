import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeviceConfig } from '../lib/deviceConfig';
import { dbListInProgressForSite } from '../services/db';
import type { Inspection } from '../types/inspection';
import { StagingLanesMap, ontologyClient } from '@gxo/semantic';

export function StagingLanesRoute() {
  const config = getDeviceConfig();
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<Inspection[]>([]);

  useEffect(() => {
    if (config) {
      dbListInProgressForSite(config.siteId).then(setInspections);
    }
  }, [config]);

  if (!config) return null;

  const handleLaneClick = (lane: string | any) => {
    console.log('Lane clicked:', lane);
    const laneName = typeof lane === 'string' ? lane : (lane?.properties?.name || lane?.name || lane?.id);
    
    if (laneName) {
      const activeInLane = inspections.filter(i => i.stagingLocation?.includes(laneName));
      if (activeInLane.length > 0) {
        navigate(`/inspection/${activeInLane[0].id}`);
      }
    }
  };

  return (
    <main style={{ maxWidth: '100%', padding: '24px 32px' }}>
      <div className="page-head" style={{ marginBottom: 24 }}>
        <div>
          <div className="xs soft" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Logistics
          </div>
          <h1 className="page-head__title" style={{ fontFamily: 'Georgia, serif', fontSize: 32 }}>Staging Lanes Map</h1>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--rule-soft)', borderRadius: 'var(--radius-md)' }}>
        <StagingLanesMap onLaneClick={handleLaneClick} />
      </div>
    </main>
  );
}
