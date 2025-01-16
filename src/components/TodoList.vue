// src/components/TodoList.vue
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { todoApi } from '../api/todoApi'
import TodoForm from './TodoForm.vue'
import TodoItem from './TodoItem.vue'
import { computed } from 'vue'

const query = useQuery({
  queryKey: ['todos'],
  queryFn: todoApi.getAll,
  staleTime: 1000 * 60 * 5, // 5 minutes
  refetchOnWindowFocus: false,
})

const todos = computed(() => query.data.value || [])
const isLoading = computed(() => query.isLoading.value)
const error = computed(() => query.error.value)
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">TODO List</h1>

    <TodoForm />

    <div v-if="isLoading" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
    </div>
    <div v-else-if="error" class="text-red-500 text-center py-4 bg-red-50 rounded">
      <p class="font-semibold">Error loading todos</p>
      <p class="text-sm">{{ error instanceof Error ? error.message : 'An error occurred' }}</p>
    </div>
    <div v-else class="space-y-4">
      <TodoItem v-for="todo in todos" :key="todo.id!" :todo="todo" />
      <p v-if="todos.length === 0" class="text-center text-gray-500">
        No todos yet. Add one above!
      </p>
    </div>
  </div>
</template>
