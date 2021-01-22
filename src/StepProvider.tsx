import React, { CSSProperties } from "react";
import { Orientation, StepCoordinate, Workflow } from "./types";

interface StepContextType {
  getLineStyles: (id: string) => CSSProperties | undefined;
}

const StepContext = React.createContext<StepContextType | undefined>(undefined);

export function useStepContext() {
  const value = React.useContext(StepContext);

  if (value == null) throw new Error("StepContext accessed outside provider");

  return value;
}

const StepProvider = ({
  workflows,
  children,
  orientation,
}: {
  workflows: Workflow[];
  children: React.ReactNode;
  orientation: Orientation;
}) => {
  const [
    rootCoordinates,
    setRootCoordinates,
  ] = React.useState<StepCoordinate>();
  const [coordinates, setCoordinates] = React.useState<
    { id: string; coordinate: StepCoordinate }[]
  >([]);

  React.useLayoutEffect(() => {
    const mappedCoordinates = workflows.map((w) => {
      const selector = `[data-step-id=${w.id}]`;
      const elem = document.querySelector(selector)?.getBoundingClientRect();
      if (elem == null)
        throw new Error(`Could not find element for selector - ${selector}`);

      const { x, y, top, left, right, bottom, width, height } = elem;
      return {
        id: w.id,
        coordinate: {
          x,
          y,
          top,
          left,
          right,
          bottom,
          width,
          height,
        },
      };
    });

    setCoordinates(mappedCoordinates);

    const rootSelector = "[data-root-id=root]";

    const root = document.querySelector(rootSelector)?.getBoundingClientRect();

    if (root == null)
      throw new Error(
        `Count not find root element for selector - ${rootSelector}`
      );

    setRootCoordinates(root);
  }, [orientation]);

  const getLineStyles = React.useCallback(
    (id: string) => {
      const fromCoordinates = coordinates.find((c) => c.id === id);
      const toStep = workflows.find((w) => w.id === id);

      if (toStep == null || toStep.nextId == null)
        throw new Error("toStep not found or step doesnt have nextId");

      const toCoordinates = coordinates.find((c) => c.id === toStep.nextId);

      if (
        fromCoordinates == null ||
        toCoordinates == null ||
        rootCoordinates == null
      )
        return undefined;

      const lineDistance =
        orientation === "vertical"
          ? toCoordinates.coordinate.top - fromCoordinates.coordinate.bottom
          : toCoordinates.coordinate.left - fromCoordinates.coordinate.right;

      console.log("coordinates for", toCoordinates, fromCoordinates);

      const width = "8px";

      const positionProperties =
        orientation === "vertical"
          ? {
              left: fromCoordinates.coordinate.width / 2,
              top: fromCoordinates.coordinate.bottom - rootCoordinates.y,
            }
          : {
              top: fromCoordinates.coordinate.height / 2,
              left: fromCoordinates.coordinate.right - rootCoordinates.x,
            };

      const style: CSSProperties = {
        width: orientation === "vertical" ? width : lineDistance,
        height: orientation === "vertical" ? lineDistance : width,
        ...positionProperties,
      };

      return style;
    },
    [coordinates]
  );

  return (
    <StepContext.Provider
      value={{
        getLineStyles,
      }}
    >
      {children}
    </StepContext.Provider>
  );
};

export default StepProvider;
