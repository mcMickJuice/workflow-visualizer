import React from 'react'
import './styles.css'

interface StepContextType {
  getLineCoordinates: (id: string) => number
}

const StepContext = React.createContext<StepContextType>({
  getLineCoordinates: () => 0
})

function useStepContext() {
  const value = React.useContext(StepContext)

  return value
}

const StepProvider = ({
  workflows,
  children
}: {
  workflows: Workflow[]
  children: React.ReactNode
}) => {
  React.useLayoutEffect(() => {
    console.log('layout effect called')
    const coordinates = workflows.map(w => {
      document.
    })
  })

  function getLineCoordinates(id: string) {
    console.log('line coordinates fetched for', id)
    return 0
  }

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
    nextId: 'third',
    name: 'Second',
    order: 1
  },
  {
    id: 'third',
    name: 'Third',
    order: 2
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

  getLineCoordinates(fromId)

  return <div className="line" />
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
