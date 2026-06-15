import { useState } from 'react'
import Register from './Pages/Register'
import Login from './Pages/Login'
import Home from './Pages/Home'
import UploadNotes from './Pages/Uploadnotes'
import Contact from './Pages/Contactus'
import Profile from './Pages/Profile'
import EditPdf from './Pages/EditPdf' // 1. IMPORT THE NEW COMPONENT
import MyNotes from './Pages/MyNotes';
import Sell from './Pages/Sell'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import { Toaster } from "react-hot-toast"
import Chat from './Pages/Chat'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home/>}/>
        <Route path="/upload-notes" element={<UploadNotes />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Sell />} />
        <Route path="/my-notes" element={<MyNotes />} />
        <Route path="/edit-notes" element={<EditPdf />} />
        <Route path="/chat" element={<Chat/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App