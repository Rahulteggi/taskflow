import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8080/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)

export const getProjects = () => api.get('/projects')
export const createProject = (data) => api.post('/projects', data)
export const deleteProject = (id) => api.delete(`/projects/${id}`)

export const getTasks = (projectId) => api.get(`/tasks?projectId=${projectId}`)
export const createTask = (data) => api.post('/tasks', data)
export const updateTask = (id, data) => api.patch(`/tasks/${id}`, data)
export const deleteTask = (id) => api.delete(`/tasks/${id}`)
