import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Game from './components/Game.tsx'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<App/>}/>
      <Route path='/game/:gameName/:id' element={<Game/>}/>
    </>
  )
)

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router}/>
)
