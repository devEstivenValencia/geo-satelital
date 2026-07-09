import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BASEMAPS, type BasemapId } from "@/lib/basemaps";

type BasemapSwitcherProps = {
  value: BasemapId;
  onChange: (id: BasemapId) => void;
};

export function BasemapSwitcher({ value, onChange }: BasemapSwitcherProps) {
  return (
    <div className="absolute bottom-8 left-4 z-10 rounded-lg bg-background/90 p-1 shadow-lg backdrop-blur">
      <ToggleGroup
        value={[value]}
        onValueChange={(vals: unknown[]) => {
          const next = vals[0] as BasemapId | undefined;
          if (next) onChange(next);
        }}
        variant="default"
        size="sm"
      >
        {(Object.keys(BASEMAPS) as BasemapId[]).map((id) => (
          <ToggleGroupItem key={id} value={id} aria-label={BASEMAPS[id].label}>
            {BASEMAPS[id].label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
