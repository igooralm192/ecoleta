import axios from 'axios'

const api = axios.create({
    baseURL: 'http://192.168.0.133:3333'
})

const ibgeApi = axios.create({
    baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades'
})

export default api

export { ibgeApi }