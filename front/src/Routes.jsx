import { RouterProvider, createHashRouter, Link } from 'react-router-dom'
import { withFaroRouterInstrumentation } from '@grafana/faro-react'

import Route1 from './routes/Route1'
import Route2 from './routes/Route2'

const routes = [
  {
    path: '/',
    element: (
      <div>
        Home
        <Link to="/route1">Route 1</Link>
      </div>
    ),
  },
  {
    path: '/route1',
    element: <Route1 />,
  },
  {
    path: '/route2',
    element: <Route2 />,
  },
]
const router = withFaroRouterInstrumentation(createHashRouter(routes))

export default function Rutas() {
  return <RouterProvider router={router} />
}
