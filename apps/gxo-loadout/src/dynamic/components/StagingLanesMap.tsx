import React, { useEffect, useState } from 'react';
import { StagingLaneObject } from '../types';
import { ontologyClient } from '../client';
import './StagingLanesMap.css';

export interface StagingLanesMapProps {
  onLaneClick?: (lane: StagingLaneObject) => void;
}

export function StagingLanesMap({ onLaneClick }: StagingLanesMapProps) {
  const [lanes, setLanes] = useState<StagingLaneObject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ontologyClient.getStagingLanes()
      .then(data => {
        setLanes(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load staging lanes.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="warehouse-grid-loading">Loading warehouse map...</div>;
  }

  if (error) {
    return <div className="warehouse-grid-error">Error: {error}</div>;
  }

  return (
    <div className="warehouse-grid">
      {lanes.map(lane => {
        const { x, y, width, length } = lane.properties.coordinates;
        
        const statusClass = `lane-status-${lane.properties.status.toLowerCase()}`;

        return (
          <div
            key={lane.id}
            className={`staging-lane-card ${statusClass}`}
            style={{
              gridColumn: `${x} / span ${width}`,
              gridRow: `${y} / span ${length}`,
            }}
            onClick={() => onLaneClick?.(lane)}
          >
            <h4 className="staging-lane-name">{lane.properties.name}</h4>
            <p className="staging-lane-load">
              Load: {lane.properties.currentLoadId || 'None'}
            </p>
            <span className="staging-lane-zone">Zone {lane.properties.zoneCode}</span>
          </div>
        );
      })}
    </div>
  );
}
