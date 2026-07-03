import express from 'express';
import sqlite3 from 'sqlite3';
import mssql from 'mssql';

const router = express.Router();

function getDbConnection() {
    const connStr = process.env.DB_CONNECTION || process.env.SQLAZURECONNSTR_DB_CONNECTION;
    const isAzure = !!connStr;
    return { isAzure, connStr };
}

async function executeQuery(sql, params = []) {
    const { isAzure, connStr } = getDbConnection();
    if (isAzure) {
        let mssqlSql = sql.replace(/LIMIT 1$/, '').replace(/LIMIT 100$/, '');
        if (sql.includes('LIMIT 1')) mssqlSql = mssqlSql.replace('SELECT ', 'SELECT TOP 1 ');
        if (sql.includes('LIMIT 100')) mssqlSql = mssqlSql.replace('SELECT ', 'SELECT TOP 100 ');
        
        await mssql.connect(connStr);
        const request = new mssql.Request();
        params.forEach((p, i) => { request.input(`p${i}`, p); mssqlSql = mssqlSql.replace('?', `@p${i}`); });
        const result = await request.query(mssqlSql);
        return { rows: result.recordset, lastInsertId: null };
    } else {
        const sqliteSql = sql.replace(/dbo\./g, '');
        const dbPath = process.env.DB_PATH || '../../DockX/db.sqlite3';
        const db = new sqlite3.Database(dbPath);
        return new Promise((resolve, reject) => {
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                db.all(sqliteSql, params, (err, rows) => {
                    if (err) reject(err); else resolve({ rows });
                });
            } else {
                db.run(sqliteSql, params, function(err) {
                    if (err) reject(err); else resolve({ lastInsertId: this.lastID });
                });
            }
        });
    }
}

router.get('/meta-data', async (req, res) => {
    try {
        const customers = await executeQuery("SELECT id, name FROM dbo.core_customer WHERE active = 1 ORDER BY name");
        const carriers = await executeQuery("SELECT id, name FROM dbo.core_carrier WHERE active = 1 ORDER BY name");
        const productTypes = await executeQuery("SELECT id, name FROM dbo.core_producttype WHERE active = 1 ORDER BY name");
        const doors = await executeQuery("SELECT id, door_name, direction, status FROM dbo.core_door WHERE active = 1 ORDER BY door_name");
        const operators = await executeQuery("SELECT id, name, initials FROM dbo.core_pitoperator WHERE active = 1 ORDER BY name");
        res.json({ customers: customers.rows, carriers: carriers.rows, productTypes: productTypes.rows, doors: doors.rows, operators: operators.rows });
    } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get('/appointment-stats', async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const total = await executeQuery("SELECT COUNT(*) as count FROM dbo.core_appointment WHERE appt_date = ? AND status != 'Cancelled'", [date]);
        const checked_in = await executeQuery("SELECT COUNT(*) as count FROM dbo.core_appointment WHERE appt_date = ? AND status IN ('Checked In', 'Early', 'On Time', 'Late')", [date]);
        const completed = await executeQuery("SELECT COUNT(*) as count FROM dbo.core_appointment WHERE appt_date = ? AND status = 'Completed'", [date]);
        const late = await executeQuery("SELECT COUNT(*) as count FROM dbo.core_appointment WHERE appt_date = ? AND status = 'Late'", [date]);
        const missed = await executeQuery("SELECT COUNT(*) as count FROM dbo.core_appointment WHERE appt_date = ? AND status = 'Missed'", [date]);
        const ib_count = await executeQuery("SELECT COUNT(*) as count FROM dbo.core_appointment WHERE appt_date = ? AND appt_type = 'IB' AND status != 'Cancelled'", [date]);
        const ob_count = await executeQuery("SELECT COUNT(*) as count FROM dbo.core_appointment WHERE appt_date = ? AND appt_type = 'OB' AND status != 'Cancelled'", [date]);
        res.json({
            total: total.rows[0].count, checked_in: checked_in.rows[0].count, completed: completed.rows[0].count,
            late: late.rows[0].count, missed: missed.rows[0].count, ib_count: ib_count.rows[0].count, ob_count: ob_count.rows[0].count
        });
    } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post('/appointments', async (req, res) => {
    try {
        const b = req.body;
        const scheduled = `${b.appt_date} ${b.appt_time}:00`;
        const now = new Date().toISOString();
        const result = await executeQuery(
            `INSERT INTO dbo.core_appointment (appt_type, appt_date, appt_time, scheduled_datetime, bol_shipment_no, delivery_no, status, notes, created_at, updated_at, carrier_id, customer_id, product_type_id, created_by, cancelled_reason) VALUES (?, ?, ?, ?, ?, ?, 'Scheduled', ?, ?, ?, ?, ?, ?, '', '')`,
            [b.appt_type, b.appt_date, b.appt_time, scheduled, b.bol_shipment_no||'', b.delivery_no||'', b.notes||'', now, now, b.carrier_id, b.customer_id, b.product_type_id]
        );
        res.json({ success: true, id: result.lastInsertId });
    } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get('/appointments', async (req, res) => {
    try {
        let sql = `SELECT a.*, cust.name as customer, carr.name as carrier, pt.name as product_type, v.visitor_name, v.trailer_no, v.check_in_time, v.check_out_time, v.dwell_seconds, d.door_name, op.name as pit_operator FROM dbo.core_appointment a LEFT JOIN dbo.core_customer cust ON a.customer_id = cust.id LEFT JOIN dbo.core_carrier carr ON a.carrier_id = carr.id LEFT JOIN dbo.core_producttype pt ON a.product_type_id = pt.id LEFT JOIN dbo.core_drivervisit v ON a.id = v.appointment_id LEFT JOIN dbo.core_door d ON v.assigned_door_id = d.id LEFT JOIN dbo.core_pitoperator op ON v.pit_operator_id = op.id WHERE 1=1`;
        let params = [];
        if (req.query.q) { sql += ` AND (a.bol_shipment_no LIKE ? OR cust.name LIKE ? OR carr.name LIKE ? OR v.visitor_name LIKE ? OR v.trailer_no LIKE ?)`; const l = `%${req.query.q}%`; params.push(l,l,l,l,l); }
        if (req.query.status) { if (req.query.status === 'Checked In') sql += ` AND a.status IN ('Checked In', 'Early', 'On Time', 'Late')`; else { sql += ` AND a.status = ?`; params.push(req.query.status); } }
        if (req.query.appt_type) { sql += ` AND a.appt_type = ?`; params.push(req.query.appt_type); }
        if (req.query.date_from) { sql += ` AND a.appt_date >= ?`; params.push(req.query.date_from); }
        if (req.query.date_to) { sql += ` AND a.appt_date <= ?`; params.push(req.query.date_to); }
        sql += ` ORDER BY a.scheduled_datetime DESC LIMIT 100`;
        const result = await executeQuery(sql, params);
        res.json({ appointments: result.rows });
    } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post('/check-in', async (req, res) => {
    try {
        const b = req.body;
        const appt = await executeQuery("SELECT scheduled_datetime FROM dbo.core_appointment WHERE id = ?", [b.appointment_id]);
        if (!appt.rows.length) return res.status(404).json({ error: "Not found" });
        const now = new Date();
        const sched = new Date(appt.rows[0].scheduled_datetime);
        const diff = (now.getTime() - sched.getTime()) / 60000;
        const status = diff < -15 ? 'Early' : (diff <= 15 ? 'On Time' : 'Late');
        const nowStr = now.toISOString().replace('T', ' ').replace('Z', '');
        await executeQuery(`INSERT INTO dbo.core_drivervisit (visitor_name, trailer_no, drivers_license_state, load_lock, check_in_time, in_out_status, notes, appointment_id, assigned_door_id, pit_operator_id) VALUES (?, ?, ?, ?, ?, 'In', ?, ?, ?, ?)`,
            [b.visitor_name||'', b.trailer_no||'', b.drivers_license_state||'', b.load_lock||'', nowStr, b.notes||'', b.appointment_id, b.assigned_door_id, b.pit_operator_id]);
        await executeQuery("UPDATE dbo.core_appointment SET status = ? WHERE id = ?", [status, b.appointment_id]);
        if (b.assigned_door_id) await executeQuery("UPDATE dbo.core_door SET status = 'Occupied' WHERE id = ?", [b.assigned_door_id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post('/check-out', async (req, res) => {
    try {
        const b = req.body;
        const visit = await executeQuery("SELECT id, check_in_time, assigned_door_id FROM dbo.core_drivervisit WHERE appointment_id = ? AND in_out_status = 'In'", [b.appointment_id]);
        if (!visit.rows.length) return res.status(404).json({ error: "Not found" });
        const v = visit.rows[0];
        const now = new Date();
        const checkin = new Date(v.check_in_time);
        const dwell = Math.floor((now.getTime() - checkin.getTime()) / 1000);
        const nowStr = now.toISOString().replace('T', ' ').replace('Z', '');
        await executeQuery(`UPDATE dbo.core_drivervisit SET check_out_time = ?, dwell_seconds = ?, in_out_status = 'Out' WHERE id = ?`, [nowStr, dwell, v.id]);
        await executeQuery("UPDATE dbo.core_appointment SET status = 'Completed' WHERE id = ?", [b.appointment_id]);
        if (v.assigned_door_id) await executeQuery("UPDATE dbo.core_door SET status = 'Open' WHERE id = ?", [v.assigned_door_id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get('/pit/tasks', async (req, res) => {
    try {
        const sql = `SELECT v.id as visit_id, a.id as appt_id, v.trailer_no, a.bol_shipment_no, a.appt_type, d.door_name, v.check_in_time, op.name as operator_name, CASE WHEN p.status IS NULL THEN 'Pending' ELSE p.status END as pit_status FROM dbo.core_drivervisit v INNER JOIN dbo.core_appointment a ON v.appointment_id = a.id LEFT JOIN dbo.core_door d ON v.assigned_door_id = d.id LEFT JOIN dbo.pit_pittask p ON p.appointment_id = a.id LEFT JOIN dbo.core_pitoperator op ON p.operator_id = op.id WHERE v.in_out_status = 'IN' AND a.status NOT IN ('Completed', 'Cancelled') AND (p.status IS NULL OR p.status = 'In Progress') ORDER BY v.check_in_time ASC`;
        const result = await executeQuery(sql);
        res.json({ trucks: result.rows });
    } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post('/pit/tasks/start', async (req, res) => {
    try {
        const b = req.body;
        let op = await executeQuery("SELECT id FROM dbo.core_pitoperator WHERE name = ?", [b.operator_name]);
        let op_id;
        if (op.rows.length) op_id = op.rows[0].id;
        else {
            const ins = await executeQuery("INSERT INTO dbo.core_pitoperator (name, status) VALUES (?, 'Active')", [b.operator_name]);
            op_id = ins.lastInsertId;
        }
        const nowStr = new Date().toISOString().replace('T', ' ').replace('Z', '');
        await executeQuery(`INSERT INTO dbo.pit_pittask (task_type, status, product_info, notes, created_at, started_at, appointment_id, operator_id) VALUES ('Load/Unload', 'In Progress', '', '', ?, ?, ?, ?)`, [nowStr, nowStr, b.appt_id, op_id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post('/pit/tasks/complete', async (req, res) => {
    try {
        const nowStr = new Date().toISOString().replace('T', ' ').replace('Z', '');
        await executeQuery("UPDATE dbo.pit_pittask SET status = 'Completed', completed_at = ? WHERE appointment_id = ?", [nowStr, req.body.appt_id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
