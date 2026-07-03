import os

# 1. Update src/types/inspection.ts to add rejected fields
p = "src/types/inspection.ts"
with open(p, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace(
    """  passInspection: PassFail;
  accuracyLabelAttached: YesNoNA;
  failureReason?: string;""",
    """  passInspection: PassFail;
  accuracyLabelAttached: YesNoNA;
  failureReason?: string;
  rejectedBagCount?: number;
  rejectedNotes?: string;"""
)

with open(p, "w", encoding="utf-8") as f:
    f.write(c)


# 2. Update src/routes/ScanPalletRoute.tsx
p = "src/routes/ScanPalletRoute.tsx"
with open(p, "r", encoding="utf-8") as f:
    c = f.read()

# Hide Accuracy Label Attached if inspection type is returns
c = c.replace(
    """          <div className="field">
            <div className="field__label">Accuracy label attached?</div>
            <div className="toggle-group">
              {(['Yes', 'No', 'N/A'] as const).map((v) => (
                <button
                  key={v}
                  className={pallet.accuracyLabelAttached === v ? 'active' : ''}
                  onClick={() =>
                    dispatch({
                      type: 'UPDATE_PALLET',
                      index: palletIndex,
                      patch: { accuracyLabelAttached: v },
                    })
                  }
                >
                  {v}
                </button>
              ))}
            </div>
          </div>""",
    """          {inspection.type !== 'returns' && (
            <div className="field">
              <div className="field__label">Accuracy label attached?</div>
              <div className="toggle-group">
                {(['Yes', 'No', 'N/A'] as const).map((v) => (
                  <button
                    key={v}
                    className={pallet.accuracyLabelAttached === v ? 'active' : ''}
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_PALLET',
                        index: palletIndex,
                        patch: { accuracyLabelAttached: v },
                      })
                    }
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}"""
)

# Show Rejected bags and Notes/Reasoning if Fail is selected
c = c.replace(
    """        {pallet.passInspection === 'Fail' && (
          <div className="field">
            <div className="field__label">Failure reason (required)</div>
            <textarea
              value={pallet.failureReason || ''}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_PALLET',
                  index: palletIndex,
                  patch: { failureReason: e.target.value },
                })
              }
              rows={3}
              placeholder="Describe what failed and what action was taken..."
            />
          </div>
        )}""",
    """        {pallet.passInspection === 'Fail' && (
          <div className="flex-col gap-16" style={{ marginTop: 16 }}>
            <div className="field">
              <div className="field__label">Rejected Bags (how many bags are rejected)</div>
              <input
                type="number"
                value={pallet.rejectedBagCount === undefined ? '' : String(pallet.rejectedBagCount)}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_PALLET',
                    index: palletIndex,
                    patch: {
                      rejectedBagCount: e.target.value === '' ? undefined : Number(e.target.value),
                    },
                  })
                }
                placeholder="0"
              />
            </div>
            <div className="field">
              <div className="field__label">Notes / Reasoning for rejection</div>
              <textarea
                value={pallet.rejectedNotes || ''}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_PALLET',
                    index: palletIndex,
                    patch: { rejectedNotes: e.target.value },
                  })
                }
                rows={3}
                placeholder="Describe why these bags were rejected (e.g. forklift damage, mouse holes, water damage)..."
              />
            </div>
          </div>
        )}"""
)

with open(p, "w", encoding="utf-8") as f:
    f.write(c)

print("ScanPalletRoute and types updated successfully")
