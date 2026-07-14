import { useMemo } from "react";
import { ChevronDown, Layers, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { GROUPS, type GroupId, type LayerDef } from "@/lib/layer-types";

type LayerPanelProps = {
  layers: LayerDef[];
  visible: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSetGroup: (group: GroupId, on: boolean) => void;
  onSetAll: (on: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LayerPanel({
  layers,
  visible,
  onToggle,
  onSetGroup,
  onSetAll,
  open,
  onOpenChange,
}: LayerPanelProps) {
  const groups = useMemo(() => {
    const ids = (Object.keys(GROUPS) as GroupId[]).sort(
      (a, b) => GROUPS[a].order - GROUPS[b].order,
    );
    return ids
      .map((g) => ({ id: g, ...GROUPS[g], layers: layers.filter((l) => l.group === g) }))
      .filter((g) => g.layers.length > 0);
  }, [layers]);

  if (!open) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="absolute left-4 top-4 z-10 shadow-lg"
        onClick={() => onOpenChange(true)}
      >
        <Layers data-icon="inline-start" />
        Capas
      </Button>
    );
  }

  return (
    <div className="absolute left-4 top-4 z-10 grid max-h-[calc(100dvh-6rem)] w-72 grid-rows-[auto_auto_minmax(0,1fr)_auto_auto] overflow-hidden rounded-xl border bg-background/90 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2 font-semibold">
          <Layers className="size-4" />
          Capas
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Ocultar panel de capas"
          onClick={() => onOpenChange(false)}
        >
          <X />
        </Button>
      </div>
      <Separator />
      <ScrollArea className="h-full min-h-0">
        <div className="space-y-1 p-2">
          {groups.map((group) => {
            const total = group.layers.length;
            const on = group.layers.filter((l) => visible[l.id]).length;
            return (
              <Collapsible key={group.id} defaultOpen>
                <div className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60">
                  <Checkbox
                    checked={on === total}
                    indeterminate={on > 0 && on < total}
                    onCheckedChange={(checked) => onSetGroup(group.id, !!checked)}
                    aria-label={`Grupo ${group.label}`}
                  />
                  <CollapsibleTrigger className="group flex flex-1 items-center justify-between text-sm font-medium">
                    <span>
                      {group.label}
                      <span className="text-muted-foreground ml-1.5 text-xs">
                        {on}/{total}
                      </span>
                    </span>
                    <ChevronDown className="size-4 transition-transform group-data-panel-open:rotate-180" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="space-y-0.5 pb-1 pl-4">
                    {group.layers.map((layer) => (
                      <div
                        key={layer.id}
                        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/60"
                      >
                        <span
                          className="size-3 shrink-0 rounded-full border border-black/20"
                          style={{ background: layer.color }}
                        />
                        <Label
                          htmlFor={`switch-${layer.id}`}
                          className="flex-1 cursor-pointer truncate text-sm font-normal"
                          title={layer.name}
                        >
                          {layer.name}
                        </Label>
                        <Switch
                          id={`switch-${layer.id}`}
                          checked={!!visible[layer.id]}
                          onCheckedChange={() => onToggle(layer.id)}
                          aria-label={layer.name}
                        />
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
      <Separator />
      <div className="flex gap-2 p-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onSetAll(true)}>
          Mostrar todo
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onSetAll(false)}>
          Ocultar todo
        </Button>
      </div>
    </div>
  );
}
