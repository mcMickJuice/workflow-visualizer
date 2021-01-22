import React from "react";
import StepProvider, { useStepContext } from "./StepProvider";
import "./styles.css";
import { Orientation, Workflow } from "./types";

const workflows: Workflow[] = [
  {
    id: "first",
    nextId: "second",
    name: "First",
    order: 0,
  },
  {
    id: "second",
    name: "Second",
    nextId: "third",
    order: 1,
  },
  {
    id: "third",
    name: "Third",
    nextId: "fourth",
    order: 2,
  },
  {
    id: "fourth",
    name: "Fourth",
    order: 3,
  },
];

const Step = ({ children }: { children: React.ReactNode }) => {
  return <div className="step">{children}</div>;
};

const Line = ({ fromId }: { fromId: string }) => {
  const { getLineStyles } = useStepContext();

  const styles = getLineStyles(fromId);

  if (styles == null) return null;

  return <div style={styles} className="line" />;
};

// layout children elements
const StepContainer = ({
  workflows,
  orientation,
}: {
  workflows: Workflow[];
  orientation: Orientation;
}) => {
  return (
    <div data-root-id="root" className={`stepContainer ${orientation}`}>
      {workflows.map((w) => (
        <React.Fragment key={w.id}>
          <Step>
            <div data-step-id={w.id} style={{ height: "100%", width: "100%" }}>
              {w.name}
            </div>
          </Step>
          {w.nextId && <Line fromId={w.id} />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function App() {
  const [orientation, setOrientation] = React.useState<Orientation>(
    "horizontal"
  );
  return (
    <div className="App">
      <button
        onClick={() =>
          setOrientation(
            orientation === "horizontal" ? "vertical" : "horizontal"
          )
        }
      >
        Click To Orientation
      </button>
      <StepProvider orientation={orientation} workflows={workflows}>
        <StepContainer orientation={orientation} workflows={workflows} />
      </StepProvider>
    </div>
  );
}
