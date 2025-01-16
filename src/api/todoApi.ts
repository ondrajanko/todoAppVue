import type { TodoEntry } from '@/types/TodoEntry'
import axios from 'axios'

const API_URL = 'http://localhost:8080/api/todos'

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

export const todoApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get<TodoEntry[]>('')
    return data
  },

  create: async (todo: Omit<TodoEntry, 'id'>) => {
    const { data } = await axiosInstance.post<TodoEntry>('', todo)
    return data
  },

  update: async (todo: TodoEntry) => {
    const { data } = await axiosInstance.put<TodoEntry>(`/${todo.id}`, todo)
    return data
  },

  delete: async (id: number) => {
    await axiosInstance.delete(`/${id}`)
  },
}
