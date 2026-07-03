import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeviceConfig } from '../lib/deviceConfig';
import { dbListInProgressForSite } from '../services/db';
import type { Inspection } from '../types/inspection';
import { ontologyClient } from '@gxo/semantic';
import { StagingLanesMap } from '../components/StagingLanesMap';
import { LANE_STATUS } from '@gxo/semantic/src/types/ontology';

export function AssignLaneComponent({ loadId, laneId }: { loadId: string, laneId: string }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAssign = async () => {
        setIsProcessing(true);
        try {
            // Trigger the kinetic action!
            await ontologyClient.executeAction('AssignLoadToLane', {
                laneId: laneId,
                loadId: loadId,
                status: LANE_STATUS.RESERVED
            });
            
            alert("Lane successfully reserved!");
            // Map will refresh naturally if we had a reload trigger, but a hard reload works for testing.
            window.location.reload();
        } catch (error: any) {
            alert(`Error assigning lane: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <button className="reserve-btn" disabled={isProcessing} onClick={handleAssign}>
            {isProcessing ? 'Processing...' : 'Reserve Lane 1 for Load XYZ'}
        </button>
    );
}

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
      <div className="page-head" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="xs soft" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Logistics
          </div>
          <h1 className="page-head__title" style={{ fontFamily: 'Georgia, serif', fontSize: 32 }}>Staging Lanes Map</h1>
        </div>
        <div>
           <AssignLaneComponent loadId="LD-XYZ-888" laneId="LANE-1" />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--rule-soft)', borderRadius: 'var(--radius-md)' }}>
        <StagingLanesMap onLaneClick={handleLaneClick} />
      </div>
    </main>
  );
}
