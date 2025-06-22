import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Doctors = () => {

  const { specialty } = useParams()

  console.log(specialty)

  const navigate = useNavigate()

  const {doctors} = useContext(AppContext)
  
  const [filterDoc, setDocFilter] = useState([])

  const [showFilter, setShowFilter] = useState(false)
  
  const applyFilter = ()=>{
    if(specialty){
      setDocFilter(doctors.filter(doc => doc.speciality === specialty ))
    } else{
      setDocFilter(doctors)
    }
  }

  useEffect(()=>{
    applyFilter()
  }, [doctors, specialty])


  return (
    <div>
        <p className='text-gray-600'>Browse through the doctors' specialty</p>
        <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
          <button className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`} onClick={()=>setShowFilter(prev => !prev)}>Filters</button>
          <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
            <p onClick={()=>specialty === 'General physician' ? navigate('/doctors'):navigate('/doctors/General physician')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${specialty === "General physician" ? "bg-indigo-100 text-black" : ""}`}>General Physician</p>
            <p onClick={()=>specialty === 'Gynecologist' ? navigate('/doctors'):navigate('/doctors/Gynecologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${specialty === "Gynecologist" ? "bg-indigo-100 text-black" : ""}`}>Gynecologist</p>
            <p onClick={()=>specialty === 'Dermatologist' ? navigate('/doctors'):navigate('/doctors/Dermatologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${specialty === "Dermatologist" ? "bg-indigo-100 text-black" : ""}`}>Dermatologist</p>
            <p onClick={()=>specialty === 'Pediatricians' ? navigate('/doctors'):navigate('/doctors/Pediatricians')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${specialty === "Pediatrician" ? "bg-indigo-100 text-black" : ""}`}>Pediatrician</p>
            <p onClick={()=>specialty === 'Neurologist' ? navigate('/doctors'):navigate('/doctors/Neurologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${specialty === "Neurologist" ? "bg-indigo-100 text-black" : ""}`}>Neurologist</p>
            <p onClick={()=>specialty === 'Gastroenterologist' ? navigate('/doctors'):navigate('/doctors/Gastroenterologist')} className='{`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${specialty === "Gastroenterologist" ? "bg-indigo-100 text-black" : ""}`}'>Gastroenterologist</p>
          </div>
          <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
            {
              filterDoc.map((item, index)=>(
                <div onClick={()=>navigate(`/appointment/${item._id}`)} key={index} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'>
                    <img className='bg-blue-50' src={item.image} alt={item.name} />
                    <div className='p-4'>
                        <div className='flex items-center gap-2 text-sm text-center text-green-500'>
                            <p className='w-2 h-2 bg-green-500 rounded-full'></p><p>Available</p>
                        </div>
                        <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                        <p className='text-gray-600 text-sm'>{item.speciality}</p>
                    </div>
                </div>
            ))
            }
          </div>
        </div>
    </div>
  )
}

export default Doctors