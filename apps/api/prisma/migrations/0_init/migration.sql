-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "address" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StagingLane" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EMPTY',
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "length" INTEGER NOT NULL,
    "zoneCode" TEXT NOT NULL,
    "siteId" TEXT,
    "currentLoadId" TEXT,

    CONSTRAINT "StagingLane_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Load" (
    "id" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "destination" TEXT,
    "expectedPalletCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "siteId" TEXT,

    CONSTRAINT "Load_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pallet" (
    "id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "productType" TEXT,
    "packagingType" TEXT,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "loadId" TEXT,
    "stagingLaneId" TEXT,

    CONSTRAINT "Pallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL,
    "inspectorName" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photosJson" TEXT,
    "notes" TEXT,
    "result" TEXT NOT NULL,
    "loadId" TEXT NOT NULL,
    "palletId" TEXT,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Inbound',
    "carrier" TEXT NOT NULL,
    "bolShipmentNo" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "productType" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Scheduled',
    "doorId" INTEGER,
    "doorName" TEXT,
    "operatorId" INTEGER,
    "operatorName" TEXT,
    "checkInTime" TEXT,
    "checkOutTime" TEXT,
    "dwellTime" TEXT,
    "pickerName" TEXT,
    "verifierName" TEXT,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Door" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'Both',
    "status" TEXT NOT NULL DEFAULT 'Open',

    CONSTRAINT "Door_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PitTask" (
    "id" SERIAL NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "stage" TEXT,
    "operatorName" TEXT,
    "type" TEXT NOT NULL DEFAULT 'Inbound/outbound',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "startedAt" TEXT,
    "completedAt" TEXT,

    CONSTRAINT "PitTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "shift" TEXT NOT NULL DEFAULT '1st',
    "jobRole" TEXT NOT NULL DEFAULT 'CSR/Clerk',
    "hireDate" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "photoUrl" TEXT,
    "shirtSize" TEXT,
    "birthday" TEXT,
    "cwr" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" TEXT,
    "cwid" TEXT,
    "notes" TEXT,
    "siteId" TEXT,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "jobRoles" TEXT NOT NULL,
    "process" TEXT,
    "action" TEXT,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSkillRating" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "skill" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 1,
    "dateAssessed" TEXT NOT NULL,
    "assessedBy" TEXT NOT NULL DEFAULT 'System',
    "notes" TEXT,

    CONSTRAINT "EmployeeSkillRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coaching" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "dateOpened" TEXT NOT NULL,
    "dateClosed" TEXT,

    CONSTRAINT "Coaching_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Other',
    "status" TEXT NOT NULL DEFAULT 'Available',
    "assignedToId" INTEGER,
    "lastInspected" TEXT,
    "serialNumber" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StagingLane_currentLoadId_key" ON "StagingLane"("currentLoadId");

-- CreateIndex
CREATE UNIQUE INDEX "Pallet_barcode_key" ON "Pallet"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "PitTask_appointmentId_stage_key" ON "PitTask"("appointmentId", "stage");

-- AddForeignKey
ALTER TABLE "StagingLane" ADD CONSTRAINT "StagingLane_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StagingLane" ADD CONSTRAINT "StagingLane_currentLoadId_fkey" FOREIGN KEY ("currentLoadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Load" ADD CONSTRAINT "Load_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pallet" ADD CONSTRAINT "Pallet_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pallet" ADD CONSTRAINT "Pallet_stagingLaneId_fkey" FOREIGN KEY ("stagingLaneId") REFERENCES "StagingLane"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_palletId_fkey" FOREIGN KEY ("palletId") REFERENCES "Pallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PitTask" ADD CONSTRAINT "PitTask_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

