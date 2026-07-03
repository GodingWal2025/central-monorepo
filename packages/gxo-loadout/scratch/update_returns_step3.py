import os

p = "src/routes/VerifyReturnsRoute.tsx"
with open(p, "r", encoding="utf-8") as f:
    c = f.read()

# Add useEffect import if not there, wait, useEffect is already imported.
# Let's verify imports: "import { useEffect, useState } from 'react';" -> Yes.

# Update VerifyReturnsInner component
# We want to add the auto-initialization effect and add/remove delivery helper functions.

inner_start = c.find("  const { inspection, dispatch } = useInspection(initial);")
update_field_idx = c.find("  const updateField = (patch: Partial<ReturnsBOLData>) => {")

new_helpers = """  const { inspection, dispatch } = useInspection(initial);
  const returnsBol = inspection.returnsBol;

  // Auto-initialize a default delivery if none exist
  useEffect(() => {
    if (inspection.bol.deliveries.length === 0) {
      dispatch({
        type: 'ADD_DELIVERY',
        delivery: {
          id: crypto.randomUUID(),
          deliveryNumber: 'D1',
          stopNumber: 1,
          lineItemIds: [],
        },
      });
    }
  }, [inspection.bol.deliveries.length, dispatch]);

  const addDelivery = () => {
    dispatch({
      type: 'ADD_DELIVERY',
      delivery: {
        id: crypto.randomUUID(),
        deliveryNumber: `D${inspection.bol.deliveries.length + 1}`,
        stopNumber: inspection.bol.deliveries.length + 1,
        lineItemIds: [],
      },
    });
  };

  const removeDelivery = (deliveryId: string) => {
    if (!window.confirm('Remove this delivery?')) return;
    dispatch({ type: 'REMOVE_DELIVERY', id: deliveryId });
  };"""

# Replace from inner_start to update_field_idx
# Note: we need to replace the exact target.
target_str = """  const { inspection, dispatch } = useInspection(initial);
  const returnsBol = inspection.returnsBol;"""

c = c.replace(target_str, new_helpers)

# Let's change canConfirm
c = c.replace(
    "  const canConfirm = true; // For now, we allow confirmation even if fields are empty, or we could require BOL number",
    "  const canConfirm = inspection.bol.deliveries.length > 0;"
)

# Insert the Deliveries section right before Expected Quantities
quantities_section_idx = c.find("      {/* ===== Expected Quantities ===== */}")

deliveries_section = """      {/* ===== Deliveries ===== */}
      <section className="section">
        <div className="section__head">
          <h2 className="section__title">
            Deliveries <em>({inspection.bol.deliveries.length})</em>
          </h2>
          <button className="btn btn--sm" onClick={addDelivery}>
            + Add delivery
          </button>
        </div>

        {inspection.bol.deliveries.length === 0 ? (
          <div className="empty">
            <div className="empty__title">No deliveries yet</div>
            <div className="empty__sub">Tap "+ Add delivery" to enter at least one.</div>
          </div>
        ) : (
          <div className="delivery-list">
            {inspection.bol.deliveries.map((d) => (
              <div key={d.id} className="card" style={{ marginBottom: 12 }}>
                <div className="field-row">
                  <div className="field">
                    <div className="field__label">Delivery #</div>
                    <input
                      className="mono"
                      value={d.deliveryNumber}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_DELIVERY',
                          id: d.id,
                          patch: { deliveryNumber: e.target.value },
                        })
                      }
                      placeholder="D1"
                    />
                  </div>
                  <div className="field" style={{ alignSelf: 'flex-end' }}>
                    <button className="btn btn--sm btn--ghost" onClick={() => removeDelivery(d.id)}>
                      Remove delivery
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

"""

c = c[:quantities_section_idx] + deliveries_section + c[quantities_section_idx:]

with open(p, "w", encoding="utf-8") as f:
    f.write(c)

print("Updated VerifyReturnsRoute.tsx successfully")
