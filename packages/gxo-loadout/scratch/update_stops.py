import os

# 1. Update VerifyRoute.tsx
p = "src/routes/VerifyRoute.tsx"
with open(p, "r", encoding="utf-8") as f:
    c = f.read()

# Replace banner
c = c.replace(
    """        <div className="banner banner--info">
          <span className="banner__icon">i</span>
          <div className="banner__body">
            One Load can have multiple Delivery #s (for one or many stops). Each line item below
            is assigned to a specific delivery.
          </div>
        </div>""",
    """        <div className="banner banner--info">
          <span className="banner__icon">i</span>
          <div className="banner__body">
            {inspection.type === 'returns'
              ? 'One Load can have multiple Delivery #s. Each line item below is assigned to a specific delivery.'
              : 'One Load can have multiple Delivery #s (for one or many stops). Each line item below is assigned to a specific delivery.'}
          </div>
        </div>"""
)

# Hide Stop # field
c = c.replace(
    """                  <div className="field">
                    <div className="field__label">Stop #</div>
                    <input
                      type="number"
                      value={d.stopNumber ?? ''}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_DELIVERY',
                          id: d.id,
                          patch: {
                            stopNumber: e.target.value === '' ? undefined : Number(e.target.value),
                          },
                        })
                      }
                      placeholder="1"
                    />
                  </div>""",
    """                  {inspection.type !== 'returns' && (
                    <div className="field">
                      <div className="field__label">Stop #</div>
                      <input
                        type="number"
                        value={d.stopNumber ?? ''}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_DELIVERY',
                            id: d.id,
                            patch: {
                              stopNumber: e.target.value === '' ? undefined : Number(e.target.value),
                            },
                          })
                        }
                        placeholder="1"
                      />
                    </div>
                  )}"""
)

with open(p, "w", encoding="utf-8") as f:
    f.write(c)


# 2. Update InspectionWorkspaceRoute.tsx
p = "src/routes/InspectionWorkspaceRoute.tsx"
with open(p, "r", encoding="utf-8") as f:
    c = f.read()

# Replace header subtext
c = c.replace(
    """              {inspection.pallets.length} pallets · {inspection.bol.deliveries.length}{' '}
              {inspection.bol.deliveries.length === 1 ? 'delivery' : 'deliveries'} ·{' '}
              {stopKeys.length} {stopKeys.length === 1 ? 'stop' : 'stops'}""",
    """              {inspection.pallets.length} pallets · {inspection.bol.deliveries.length}{' '}
              {inspection.bol.deliveries.length === 1 ? 'delivery' : 'deliveries'}
              {inspection.type !== 'returns' && <> · {stopKeys.length} {stopKeys.length === 1 ? 'stop' : 'stops'}</>}"""
)

# Replace Scan next pallet subtext
c = c.replace(
    """            <div className="btn--hero__title">Scan next pallet</div>
            <div className="btn--hero__sub">Pick stop, delivery, and pallet type</div>""",
    """            <div className="btn--hero__title">Scan next pallet</div>
            <div className="btn--hero__sub">
              {inspection.type === 'returns' ? 'Pick delivery and pallet type' : 'Pick stop, delivery, and pallet type'}
            </div>"""
)

# Replace AddPalletModal instantiation
c = c.replace(
    """        {showAddModal && (
          <AddPalletModal
            stops={stops}
            stopKeys={stopKeys}
            onAdd={addPallet}
            onClose={() => setShowAddModal(false)}
          />
        )}""",
    """        {showAddModal && (
          <AddPalletModal
            stops={stops}
            stopKeys={stopKeys}
            deliveries={inspection.bol.deliveries}
            isReturns={inspection.type === 'returns'}
            onAdd={addPallet}
            onClose={() => setShowAddModal(false)}
          />
        )}"""
)

# Replace rendering loop (StopSection vs Delivery rendering)
c = c.replace(
    """        {inspection.bol.deliveries.length === 0 ? (
          <div className="empty">
            <div className="empty__title">No deliveries on this load</div>
            <div className="empty__sub">
              Go back to verify the BOL and add at least one delivery before scanning pallets.
            </div>
            <Link
              to={`/inspection/${inspection.id}/verify`}
              className="btn btn--accent"
              style={{ marginTop: 12 }}
            >
              Back to verify
            </Link>
          </div>
        ) : (
          stopKeys.map((stopKey) => (
            <StopSection
              key={stopKey}
              stopKey={stopKey}
              deliveries={stops[stopKey]}
              palletsByDelivery={palletsByDelivery}
              inspectionId={inspection.id}
            />
          ))
        )}""",
    """        {inspection.bol.deliveries.length === 0 ? (
          <div className="empty">
            <div className="empty__title">No deliveries on this load</div>
            <div className="empty__sub">
              Go back to verify the BOL and add at least one delivery before scanning pallets.
            </div>
            <Link
              to={`/inspection/${inspection.id}/verify`}
              className="btn btn--accent"
              style={{ marginTop: 12 }}
            >
              Back to verify
            </Link>
          </div>
        ) : inspection.type === 'returns' ? (
          inspection.bol.deliveries.map((delivery) => {
            const pallets = palletsByDelivery[delivery.id] || [];
            return (
              <section key={delivery.id} className="stop-section">
                <div className="stop-section__head">
                  <h2 className="stop-section__title">Delivery {delivery.deliveryNumber}</h2>
                  <span className="stop-section__meta">
                    {pallets.length} {pallets.length === 1 ? 'pallet' : 'pallets'}
                  </span>
                </div>
                {pallets.length === 0 ? (
                  <div className="empty" style={{ padding: 16 }}>
                    <div className="empty__sub">No pallets scanned for this delivery yet.</div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: 8,
                    }}
                  >
                    {pallets.map((p) => (
                      <Link
                        key={p.palletNumber}
                        to={`/inspection/${inspection.id}/pallet/${p.palletNumber - 1}`}
                        className="card"
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          margin: 0,
                          borderLeft: p.qualityFlag ? '3px solid var(--danger)' : undefined,
                        }}
                      >
                        <div className="row-between">
                          <div
                            className="xs soft"
                            style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                          >
                            Pallet {p.palletNumber}
                          </div>
                          {p.scannedBy && (
                            <div
                              className="xs soft"
                              title={`Scanned by ${p.scannedBy}`}
                              style={{ fontFamily: 'JetBrains Mono, monospace' }}
                            >
                              {p.scannedBy.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="fw-500" style={{ fontSize: 20, marginTop: 4 }}>
                          {p.batchSections.reduce(
                            (sum: number, bs) => sum + (bs.actualBagCount.value || 0),
                            0
                          ) || '—'}
                          <span className="xs soft fw-500" style={{ marginLeft: 4 }}>bags</span>
                        </div>
                        {p.batchSections.map((bs) => (
                          <div key={bs.id} className="xs mono faint" style={{ marginTop: 2 }}>
                            {bs.batchCode.value || '—'}
                            {bs.actualBagCount.value !== null && (
                              <span style={{ color: 'var(--ink-soft)' }}>
                                {' '}· {bs.actualBagCount.value}
                              </span>
                            )}
                          </div>
                        ))}
                        <div className="xs soft" style={{ marginTop: 4 }}>{p.palletType}</div>
                        {p.qualityFlag && (
                          <div className="xs" style={{ color: 'var(--danger)', marginTop: 4 }}>
                            ⚑ Flagged
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            );
          })
        ) : (
          stopKeys.map((stopKey) => (
            <StopSection
              key={stopKey}
              stopKey={stopKey}
              deliveries={stops[stopKey]}
              palletsByDelivery={palletsByDelivery}
              inspectionId={inspection.id}
            />
          ))
        )}"""
)

# Update AddPalletModal definition and state initialization
c = c.replace(
    """function AddPalletModal({
  stops,
  stopKeys,
  onAdd,
  onClose,
}: {
  stops: Record<string, Delivery[]>;
  stopKeys: string[];
  onAdd: (palletType: PalletType, deliveryId: string, batchCount: 1 | 2 | 3) => void;
  onClose: () => void;
}) {
  const [stopKey, setStopKey] = useState(stopKeys[0] || '');
  const deliveriesForStop = stops[stopKey] || [];
  const [deliveryId, setDeliveryId] = useState(deliveriesForStop[0]?.id || '');""",
    """function AddPalletModal({
  stops,
  stopKeys,
  deliveries,
  isReturns,
  onAdd,
  onClose,
}: {
  stops: Record<string, Delivery[]>;
  stopKeys: string[];
  deliveries: Delivery[];
  isReturns: boolean;
  onAdd: (palletType: PalletType, deliveryId: string, batchCount: 1 | 2 | 3) => void;
  onClose: () => void;
}) {
  const [stopKey, setStopKey] = useState(stopKeys[0] || '');
  const [deliveryId, setDeliveryId] = useState(() => {
    if (isReturns) return deliveries[0]?.id || '';
    const deliveriesForStop = stops[stopKeys[0] || ''] || [];
    return deliveriesForStop[0]?.id || '';
  });"""
)

# Update AddPalletModal return rendering for stop/delivery dropdowns
c = c.replace(
    """        <div className="modal__field">
          <label>Stop</label>
          <select value={stopKey} onChange={(e) => handleStopChange(e.target.value)}>
            {stopKeys.map((k) => (
              <option key={k} value={k}>
                {k === 'unassigned' ? 'Unassigned' : `Stop ${k}`}
              </option>
            ))}
          </select>
        </div>

        <div className="modal__field">
          <label>Delivery</label>
          <select value={deliveryId} onChange={(e) => setDeliveryId(e.target.value)}>
            {deliveriesForStop.map((d) => (
              <option key={d.id} value={d.id}>
                {d.deliveryNumber}
              </option>
            ))}
          </select>
        </div>""",
    """        {!isReturns && (
          <div className="modal__field">
            <label>Stop</label>
            <select value={stopKey} onChange={(e) => handleStopChange(e.target.value)}>
              {stopKeys.map((k) => (
                <option key={k} value={k}>
                  {k === 'unassigned' ? 'Unassigned' : `Stop ${k}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="modal__field">
          <label>Delivery</label>
          <select value={deliveryId} onChange={(e) => setDeliveryId(e.target.value)}>
            {isReturns
              ? deliveries.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.deliveryNumber}
                  </option>
                ))
              : (stops[stopKey] || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.deliveryNumber}
                  </option>
                ))}
          </select>
        </div>"""
)

with open(p, "w", encoding="utf-8") as f:
    f.write(c)


# 3. Update ScanPalletRoute.tsx
p = "src/routes/ScanPalletRoute.tsx"
with open(p, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace(
    """                {delivery.stopNumber !== undefined && <> (Stop {delivery.stopNumber})</>}""",
    """                {inspection.type !== 'returns' && delivery.stopNumber !== undefined && <> (Stop {delivery.stopNumber})</>}"""
)

with open(p, "w", encoding="utf-8") as f:
    f.write(c)

print("Updated stops to delivery sections logic successfully")
