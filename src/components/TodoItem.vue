<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { todoApi } from '../api/todoApi'
import type { TodoEntry } from '@/types/TodoEntry'

const props = defineProps<{
  todo: TodoEntry
}>()

const queryClient = useQueryClient()

const updateMutation = useMutation({
  mutationFn: todoApi.update,
  onMutate: async (updatedTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] })
    const previousTodos = queryClient.getQueryData<TodoEntry[]>(['todos'])

    queryClient.setQueryData(['todos'], (old: TodoEntry[] = []) =>
      old.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)),
    )

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

const deleteMutation = useMutation({
  mutationFn: todoApi.delete,
  onMutate: async (todoId) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] })
    const previousTodos = queryClient.getQueryData<TodoEntry[]>(['todos'])

    queryClient.setQueryData(['todos'], (old: TodoEntry[] = []) =>
      old.filter((todo) => todo.id !== todoId),
    )

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

const handleToggle = () => {
  updateMutation.mutate({
    ...props.todo,
    completed: !props.todo.completed,
  })
}
</script>

<template>
  <div class="p-4 bg-white rounded shadow flex items-center justify-between">
    <div class="flex items-center space-x-4">
      <input type="checkbox" :checked="todo.completed" @change="handleToggle" class="h-5 w-5" />
      <div>
        <h3 :class="{ 'line-through': todo.completed }" class="font-semibold">
          {{ todo.title }}
        </h3>
        <p class="text-gray-600">{{ todo.description }}</p>
      </div>
    </div>
    <div class="space-x-2">
      <button
        @click="deleteMutation.mutate(todo.id!)"
        class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        :disabled="deleteMutation.isPending.value"
      >
        {{ deleteMutation.isPending.value ? 'Deleting...' : 'Delete' }}
      </button>
    </div>
  </div>
</template>
