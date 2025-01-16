<script setup lang="ts">
import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { todoApi } from '../api/todoApi'
import type { TodoEntry } from '@/types/TodoEntry'

const props = defineProps<{
  todo: TodoEntry
}>()

const queryClient = useQueryClient()
const isEditing = ref(false)
const editedTitle = ref(props.todo.title)
const editedDescription = ref(props.todo.description)

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

const startEditing = () => {
  isEditing.value = true
  editedTitle.value = props.todo.title
  editedDescription.value = props.todo.description
}

const saveEdit = () => {
  if (editedTitle.value.trim()) {
    updateMutation.mutate({
      ...props.todo,
      title: editedTitle.value,
      description: editedDescription.value,
    })
    isEditing.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editedTitle.value = props.todo.title
  editedDescription.value = props.todo.description
}
</script>

<template>
  <div class="p-4 bg-white rounded shadow flex items-center justify-between">
    <div class="flex items-center space-x-4 flex-grow">
      <input type="checkbox" :checked="todo.completed" @change="handleToggle" class="h-5 w-5" />
      <div class="flex-grow">
        <template v-if="isEditing">
          <input
            v-model="editedTitle"
            type="text"
            class="w-full p-2 border rounded mb-2"
            placeholder="Title"
            @keyup.enter="saveEdit"
            @keyup.esc="cancelEdit"
          />
          <textarea
            v-model="editedDescription"
            class="w-full p-2 border rounded"
            placeholder="Description"
          ></textarea>
        </template>
        <template v-else>
          <h3 :class="{ 'line-through': todo.completed }" class="font-semibold">
            {{ todo.title }}
          </h3>
          <p class="text-gray-600">{{ todo.description }}</p>
        </template>
      </div>
    </div>
    <div class="space-x-2 space-y-2">
      <template v-if="isEditing">
        <button
          @click="saveEdit"
          class="bg-green-500 text-white px-3 py-1 ml-2 rounded hover:bg-green-600"
          :disabled="updateMutation.isPending.value"
        >
          {{ updateMutation.isPending.value ? 'Saving...' : 'Save' }}
        </button>
        <button
          @click="cancelEdit"
          class="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </template>
      <template v-else>
        <button
          @click="startEditing"
          class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          @click="deleteMutation.mutate(todo.id!)"
          class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          :disabled="deleteMutation.isPending.value"
        >
          {{ deleteMutation.isPending.value ? 'Deleting...' : 'Delete' }}
        </button>
      </template>
    </div>
  </div>
</template>
