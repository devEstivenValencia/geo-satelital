import { useCallback, useState } from "react";
import type { GroupId, LayerDef } from "@/lib/layer-types";

export function useLayerVisibility(layers: LayerDef[]) {
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(layers.map((l) => [l.id, l.defaultVisible])),
  );

  const toggle = useCallback((id: string) => {
    setVisible((v) => ({ ...v, [id]: !v[id] }));
  }, []);

  const setLayer = useCallback((id: string, on: boolean) => {
    setVisible((v) => ({ ...v, [id]: on }));
  }, []);

  const setGroup = useCallback(
    (group: GroupId, on: boolean) => {
      setVisible((v) => {
        const next = { ...v };
        for (const l of layers) if (l.group === group) next[l.id] = on;
        return next;
      });
    },
    [layers],
  );

  const setAll = useCallback(
    (on: boolean) => {
      setVisible(Object.fromEntries(layers.map((l) => [l.id, on])));
    },
    [layers],
  );

  /** Deja visibles exactamente estas capas (usado por las diapositivas). */
  const showExactly = useCallback(
    (ids: string[]) => {
      const set = new Set(ids);
      setVisible(Object.fromEntries(layers.map((l) => [l.id, set.has(l.id)])));
    },
    [layers],
  );

  return { visible, toggle, setLayer, setGroup, setAll, showExactly };
}
