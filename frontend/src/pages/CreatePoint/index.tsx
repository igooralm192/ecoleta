import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'

import { LeafletMouseEvent } from 'leaflet'

import Dropzone from '../../components/Dropzone'

import api, { ibgeApi } from '../../services/api'

import Logo from '../../assets/logo.svg'

import './styles.css'

interface Item {
  id: number
  title: string
  image_url: string
}

interface IBGEUFResponse {
  sigla: string
}

interface IBGECityResponse {
  nome: string
}

interface MapEventProps {
  initialPosition: [number, number]
  onClick: (event: LeafletMouseEvent) => void
}

const MapEvent: React.FC<MapEventProps> = ({ initialPosition, onClick }) => {
  const map = useMapEvents({
    click: onClick,
  })

  useEffect(() => {
    map.flyTo(initialPosition)
  }, [map, initialPosition])

  return null
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])

  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })

  const [selectedUf, setSelectedUf] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null)
  const [selectedFile, setSelectedFile] = useState<File>()

  const history = useHistory()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords

      setInitialPosition([latitude, longitude])
      setSelectedPosition([latitude, longitude])
    })
  }, [])

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data)
    })
  }, [])

  useEffect(() => {
    ibgeApi.get<IBGEUFResponse[]>('estados').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla)

      setUfs(ufInitials)
    })
  }, [])

  useEffect(() => {
    if (selectedUf === '') return

    ibgeApi.get<IBGECityResponse[]>(`estados/${selectedUf}/municipios`).then(response => {
      setCities(response.data.map(city => city.nome))
    })
  }, [selectedUf])

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value)
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value)
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  function handleSelectItem(itemId: number) {
    const selectedItemIndex = selectedItems.findIndex(item => item === itemId)

    if (selectedItemIndex !== -1) {
      selectedItems.splice(selectedItemIndex, 1)
      setSelectedItems([...selectedItems])

      return
    }

    setSelectedItems([...selectedItems, itemId])
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()    

    if (selectedPosition == null) return

    const { name, email, whatsapp } = formData
    const uf = selectedUf
    const city = selectedCity
    const [latitude, longitude] = selectedPosition
    const items = selectedItems

    const data = new FormData()

    data.append('name', name)
    data.append('email', email)
    data.append('whatsapp', whatsapp)
    data.append('uf', uf)
    data.append('city', city)
    data.append('latitude', String(latitude))
    data.append('longitude', String(longitude))
    data.append('items', items.join(','))
    
    if (selectedFile) {
      data.append('image', selectedFile)
    }

    await api.post('points', data)

    alert('Ponto de coleta criado!')

    history.push('/')
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={Logo} alt="Ecoleta" />

        <Link to='/'>
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>


          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text" name="name" id="name" onChange={handleInputChange} />
          </div>


          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="email" name="email" id="email" onChange={handleInputChange} />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
            </div>

          </div>

        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <MapContainer
            center={initialPosition}
            zoom={15}
            scrollWheelZoom={false}

          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition ?? initialPosition} />

            <MapEvent initialPosition={initialPosition} onClick={handleMapClick} />
          </MapContainer>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                <option value="">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                <option value="">Selecione uma cidade</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li
                key={item.id}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
                onClick={() => handleSelectItem(item.id)}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type='submit'>
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  )
}

export default CreatePoint