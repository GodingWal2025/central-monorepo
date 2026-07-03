import os

# 1. Update src/types/inspection.ts
p = "src/types/inspection.ts"
with open(p, "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace(
    "  expectedPallets?: number;\n  expectedEmptySeedPaks?: number;\n  expectedLids?: number;\n  expectedProductSeedPaks?: number;",
    "  expectedPallets54x40?: number;\n  expectedPallets40x40?: number;\n  expectedEmptySeedPaks?: number;\n  expectedProductSeedPaks?: number;"
)
c = c.replace(
    "  expectedPallets: Suggestable<number>;\n  expectedEmptySeedPaks: Suggestable<number>;\n  expectedLids: Suggestable<number>;\n  expectedProductSeedPaks: Suggestable<number>;",
    "  expectedPallets54x40: Suggestable<number>;\n  expectedPallets40x40: Suggestable<number>;\n  expectedEmptySeedPaks: Suggestable<number>;\n  expectedProductSeedPaks: Suggestable<number>;"
)
with open(p, "w", encoding="utf-8") as f:
    f.write(c)

# 2. Update src/hooks/useInspection.ts
p = "src/hooks/useInspection.ts"
with open(p, "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace(
    "      expectedPallets: emptySuggestable(),\n      expectedEmptySeedPaks: emptySuggestable(),\n      expectedLids: emptySuggestable(),\n      expectedProductSeedPaks: emptySuggestable(),",
    "      expectedPallets54x40: emptySuggestable(),\n      expectedPallets40x40: emptySuggestable(),\n      expectedEmptySeedPaks: emptySuggestable(),\n      expectedProductSeedPaks: emptySuggestable(),"
)
with open(p, "w", encoding="utf-8") as f:
    f.write(c)

# 3. Update src/routes/VerifyReturnsRoute.tsx
p = "src/routes/VerifyReturnsRoute.tsx"
with open(p, "r", encoding="utf-8") as f:
    c = f.read()

# We need to create a wrapper that displays the BOL expected quantity.
# The user said: "For each entry box where the operatior will input their data, just above it I want in grey the expected quantity from BOL or Returned Goods Form. Also Two different types of wooden pallets one is 54x40 and the other is 40x40. Get rid of the Lids box."
# In VerifyReturnsRoute, we use SuggestableField.
# We'll replace the "Expected quantities" section with custom fields.

# First, add our custom ReturnsQtyField at the bottom of the file
custom_field = """
function ReturnsQtyField({
  label,
  field,
  onChange,
}: {
  label: string;
  field: Suggestable<number>;
  onChange: (next: Suggestable<number>) => void;
}) {
  const hasSuggestion = field.mlSuggestion !== undefined && field.mlSuggestion !== null;
  const expectedStr = hasSuggestion ? String(field.mlSuggestion) : 'Unknown';

  const handleChange = (raw: string) => {
    const next: number | null = raw === '' ? null : Number(raw);
    let source: Suggestable<number>['source'] = 'manual';
    if (next === null) source = 'empty';
    else if (hasSuggestion && String(next) === String(field.mlSuggestion)) source = 'ml-accepted';
    else if (hasSuggestion) source = 'ml-edited';
    onChange({ ...field, value: next, source });
  };

  return (
    <div className="field">
      <div className="field__label">{label}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8, fontStyle: 'italic' }}>
        Expected from BOL: {expectedStr}
      </div>
      <input
        type="number"
        value={field.value === null ? '' : String(field.value)}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="0"
      />
    </div>
  );
}
"""

c += custom_field

# Now replace the expected quantities section
section_start = c.find("{/* ===== Expected Quantities ===== */}")
section_end = c.find("</section>", section_start) + len("</section>")

new_section = """{/* ===== Expected Quantities ===== */}
      <section className="section">
        <div className="section__head">
          <h2 className="section__title">Expected <em>quantities</em></h2>
        </div>

        <div className="card">
          <div className="field-row" style={{ marginBottom: 16 }}>
            <ReturnsQtyField
              label="Wooden Pallets (54x40)"
              field={returnsBol.expectedPallets54x40}
              onChange={(field) => updateField({ expectedPallets54x40: field })}
            />
            <ReturnsQtyField
              label="Wooden Pallets (40x40)"
              field={returnsBol.expectedPallets40x40}
              onChange={(field) => updateField({ expectedPallets40x40: field })}
            />
          </div>
          
          <div className="field-row" style={{ marginBottom: 16 }}>
            <ReturnsQtyField
              label="Empty SeedPaks"
              field={returnsBol.expectedEmptySeedPaks}
              onChange={(field) => updateField({ expectedEmptySeedPaks: field })}
            />
            <ReturnsQtyField
              label="Product SeedPaks"
              field={returnsBol.expectedProductSeedPaks}
              onChange={(field) => updateField({ expectedProductSeedPaks: field })}
            />
          </div>

          <div className="field-row">
            <ReturnsQtyField
              label="Bagged Product (pallets)"
              field={returnsBol.expectedBaggedProduct}
              onChange={(field) => updateField({ expectedBaggedProduct: field })}
            />
          </div>
        </div>
      </section>"""

c = c[:section_start] + new_section + c[section_end:]

with open(p, "w", encoding="utf-8") as f:
    f.write(c)

print("Done updating files")
