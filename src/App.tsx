import React, { CSSProperties } from 'react'
import './styles.css'

interface StepContextType {
  getLineCoordinates: (id: string) => StepCoordinate | undefined
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

  const getLineCoordinates = React.useCallback(
    (id: string) => {
      const coordinate = coordinates.find((c) => c.id === id)

      if (coordinate == null) return undefined

      return coordinate.coordinate
    },
    [coordinates]
  )

  return (
    <StepContext.Provider
      value={{
        getLineCoordinates
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
  const { getLineCoordinates } = useStepContext()

  const fromCoordinates = getLineCoordinates(fromId)
  const toCoordinates = getLineCoordinates(toId)

  if (fromCoordinates == null || toCoordinates == null) return null
  console.log('fromCoordinates', fromCoordinates)
  console.log('toCoordinates', toCoordinates)

  const style: CSSProperties = {
    width: '8px',
    height: toCoordinates.top - fromCoordinates.bottom,
    left: fromCoordinates.width / 2,
    top: fromCoordinates.bottom - 12 + 'px',
    bottom: toCoordinates.top - 12 + 'px'
  }

  return <div style={style} className="line" />
}

// layout children elements
const StepContainer = ({ workflows }: { workflows: Workflow[] }) => {
  return (
    <div className="stepContainer">
      {workflows.map((w) => (
        <React.Fragment key={w.id}>
          <Step id={w.id}>{w.name}</Step>
          {w.nextId && <Line fromId={w.id} toId={w.nextId} />}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function App() {
  return (
    <div className="App">
      <StepProvider workflows={workflows}>
        <StepContainer workflows={workflows} />
      </StepProvider>
    </div>
  )
}
