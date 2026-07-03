-- Azure SQL Schema for Staging Lanes

CREATE TABLE dbo.StagingLanes (
    LaneID VARCHAR(50) PRIMARY KEY,
    LaneName VARCHAR(100) NOT NULL,
    ZoneCode VARCHAR(10) NOT NULL,       -- e.g., 'A', 'B'
    GridCoordinates VARCHAR(MAX) NOT NULL,-- JSON string: {"x": 1, "y": 4, "width": 2, "length": 10}
    CurrentLoadID VARCHAR(50) NULL,      -- Linked to your ShipmentLoads table
    Status VARCHAR(20) NOT NULL          -- 'EMPTY', 'STAGED', 'RESERVED', 'BLOCKED'
);

-- Example Insert:
-- INSERT INTO dbo.StagingLanes (LaneID, LaneName, ZoneCode, GridCoordinates, CurrentLoadID, Status)
-- VALUES ('LANE-04', 'Staging Lane 4', 'A', '{"x": 1, "y": 4, "width": 2, "length": 10}', NULL, 'EMPTY');
