import React, { CSSProperties } from 'react'
import './styles.css'

interface StepContextType {
  getLineStyles: (id: string) => CSSProperties | undefined
}

const StepContext = React.createContext<StepContextType | undefined>(undefined)

function useStepContext() {
  const value = React.useContext(StepContext)

  if (value == null) throw new Error('StepContext accessed outside provider')

  return value
}

interface StepCoordinate {
  x: number
  y: number
  top: number
  left: number
  right: number
  bottom: number
  width: number
}

const StepProvider = ({
  workflows,
  children
}: {
  workflows: Workflow[]
  children: React.ReactNode
}) => {
  const [coordinates, setCoordinates] = React.useState<
    { id: string; coordinate: StepCoordinate }[]
  >([])

  React.useLayoutEffect(() => {
    console.log('layout effect called')
    const mappedCoordinates = workflows.map((w) => {
      const selector = `[data-step-id=${w.id}]`
      const elem = document.querySelector(selector)?.getBoundingClientRect()
      if (elem == null)
        throw new Error(`Could not find element for selector - ${selector}`)

      const { x, y, top, left, right, bottom, width } = elem
      return {
        id: w.id,
        coordinate: {
          x,
          y,
          top,
          left,
          right,
          bottom,
          width
        }
      }
    })

    setCoordinates(mappedCoordinates)
  }, [])

  const getLineStyles = React.useCallback(
    (id: string) => {
      const fromCoordinates = coordinates.find((c) => c.id === id)
      const toStep = workflows.find((w) => w.id === id)

      if (toStep == null || toStep.nextId == null)
        throw new Error('toStep not found or step doesnt have nextId')

      const toCoordinates = coordinates.find((c) => c.id === toStep.nextId)

      if (fromCoordinates == null || toCoordinates == null) return undefined

      const style: CSSProperties = {
        width: '8px',
        height:
          toCoordinates.coordinate.top - fromCoordinates.coordinate.bottom,
        left: fromCoordinates.coordinate.width / 2,
        top: fromCoordinates.coordinate.bottom - 12 + 'px',
        bottom: toCoordinates.coordinate.top - 12 + 'px'
      }

      return style
    },
    [coordinates]
  )

  return (
    <StepContext.Provider
      value={{
        getLineStyles
      }}
    >
      {children}
    </StepContext.Provider>
  )
}

interface Workflow {
  id: string
  nextId?: string
  name: string
  order: number
}

const workflows: Workflow[] = [
  {
    id: 'first',
    nextId: 'second',
    name: 'First',
    order: 0
  },
  {
    id: 'second',
    name: 'Second',
    nextId: 'third',
    order: 1
  },
  {
    id: 'third',
    name: 'Third',
    nextId: 'fourth',
    order: 2
  },
  {
    id: 'fourth',
    name: 'Fourth',
    order: 3
  }
]

const Step = ({ children, id }: { children: React.ReactNode; id: string }) => {
  return (
    <div data-step-id={id} className="step">
      {children}
    </div>
  )
}

const Line = ({ fromId, toId }: { fromId: string; toId: string }) => {
  const { getLineStyles } = useStepContext()

  const styles = getLineStyles(fromId)

  if (styles == null) return null

  return <div style={styles} className="line" />
}

// layout children elements
const StepContainer = ({
  workflows,
  orientation
}: {
  workflows: Workflow[]
  orientation: Orientation
}) => {
  return (
    <div className={`stepContainer ${orientation}`}>
      {workflows.map((w) => (
        <React.Fragment key={w.id}>
          <Step id={w.id}>{w.name}</Step>
          {w.nextId && <Line fromId={w.id} toId={w.nextId} />}
        </React.Fragment>
      ))}
    </div>
  )
}

type Orientation = 'vertical' | 'horizontal'

export default function App() {
  const orientation: Orientation = 'vertical'
  return (
    <div className="App">
      <StepProvider workflows={workflows}>
        <StepContainer orientation={orientation} workflows={workflows} />
      </StepProvider>
    </div>
  )
}
