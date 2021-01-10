import { Route, BrowserRouter as Router } from 'react-router-dom'

import Home from './pages/Home'
import CreatePoint from './pages/CreatePoint'

const Routes = () => {
    return (
      <Router>
        <Route component={Home} path="/" exact/>
        <Route component={CreatePoint} path="/create-point"/>
      </Router>
    )
}

export default Routes