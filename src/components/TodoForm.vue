<script setup lang="ts">
import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { todoApi } from '../api/todoApi'
import type { TodoEntry } from '@/types/TodoEntry'

const queryClient = useQueryClient()

const newTodo = ref({
  title: '',
  description: '',
})

const createTodoMutation = useMutation({
  mutationFn: todoApi.create,
  onMutate: async (newTodoData) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    const previousTodos = queryClient.getQueryData<TodoEntry[]>(['todos'])

    queryClient.setQueryData(['todos'], (old: TodoEntry[] = []) => [
      ...old,
      { ...newTodoData, id: Date.now(), completed: false },
    ])

    return { previousTodos }
  },
  onError: (err, variables, context) => {
    if (context?.previousTodos) {
      queryClient.setQueryData(['todos'], context.previousTodos)
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})

const handleSubmit = (e: Event) => {
  e.preventDefault()

  if (!newTodo.value.title.trim()) {
    return
  }

  createTodoMutation.mutate({
    title: newTodo.value.title,
    description: newTodo.value.description,
    completed: false,
  })

  newTodo.value = {
    title: '',
    description: '',
  }
}
</script>

<template>
  <div class="mb-8 p-4 bg-white rounded shadow">
    <h2 class="text-xl font-semibold mb-4">Add New Todo</h2>
    <form @submit="handleSubmit" class="space-y-4">
      <div>
        <input
          v-model="newTodo.title"
          type="text"
          placeholder="Title"
          class="w-full p-2 border rounded"
          required
          minlength="3"
        />
      </div>
      <div>
        <textarea
          v-model="newTodo.description"
          placeholder="Description"
          class="w-full p-2 border rounded"
        />
      </div>
      <button
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        :disabled="createTodoMutation.isPending.value"
      >
        Add Todo
      </button>
    </form>
  </div>
</template>
