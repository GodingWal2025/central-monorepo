import os

# 1. Update src/routes/CaptureReturnsBOLRoute.tsx
p = "src/routes/CaptureReturnsBOLRoute.tsx"
with open(p, "r", encoding="utf-8") as f:
    c = f.read()

# Replace expectedPallets extraction
c = c.replace(
    """      expectedPallets: extractNum(mlResults.returnsBolFields?.expectedPallets),
      expectedEmptySeedPaks: extractNum(mlResults.returnsBolFields?.expectedEmptySeedPaks),
      expectedLids: extractNum(mlResults.returnsBolFields?.expectedLids),
      expectedProductSeedPaks: extractNum(mlResults.returnsBolFields?.expectedProductSeedPaks),""",
    """      expectedPallets54x40: extractNum(mlResults.returnsBolFields?.expectedPallets54x40),
      expectedPallets40x40: extractNum(mlResults.returnsBolFields?.expectedPallets40x40),
      expectedEmptySeedPaks: extractNum(mlResults.returnsBolFields?.expectedEmptySeedPaks),
      expectedProductSeedPaks: extractNum(mlResults.returnsBolFields?.expectedProductSeedPaks),"""
)

# Replace expectedPallets fallback
c = c.replace(
    """          expectedPallets: {
            value: null,
            source: inspection.returnsBol?.expectedPallets?.source || 'empty',
          },
          expectedEmptySeedPaks: {
            value: null,
            source: 'empty',
          },
          expectedLids: {
            value: null,
            source: 'empty',
          },
          expectedProductSeedPaks: {
            value: null,
            source: 'empty',
          },""",
    """          expectedPallets54x40: {
            value: null,
            source: inspection.returnsBol?.expectedPallets54x40?.source || 'empty',
          },
          expectedPallets40x40: {
            value: null,
            source: inspection.returnsBol?.expectedPallets40x40?.source || 'empty',
          },
          expectedEmptySeedPaks: {
            value: null,
            source: 'empty',
          },
          expectedProductSeedPaks: {
            value: null,
            source: 'empty',
          },"""
)

with open(p, "w", encoding="utf-8") as f:
    f.write(c)


# 2. Update src/routes/ReviewAndCompleteRoute.tsx
p = "src/routes/ReviewAndCompleteRoute.tsx"
with open(p, "r", encoding="utf-8") as f:
    c = f.read()

# Instead of total expected pallets, let's just show 54x40 and 40x40 separately or combined.
# The user asked to display two different types of wooden pallets. It makes sense to tally them up combined here.
c = c.replace(
    """<td className="right num">{returnsBol.expectedPallets.value || 0}</td>""",
    """<td className="right num">{(returnsBol.expectedPallets54x40.value || 0) + (returnsBol.expectedPallets40x40.value || 0)}</td>"""
)
c = c.replace(
    """returnsBol.expectedPallets.value === returnsActuals.pallets""",
    """((returnsBol.expectedPallets54x40.value || 0) + (returnsBol.expectedPallets40x40.value || 0)) === returnsActuals.pallets"""
)

with open(p, "w", encoding="utf-8") as f:
    f.write(c)

print("Done")
