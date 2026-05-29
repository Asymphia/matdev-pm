import TaskCategoriesPageClient from "@/components/task-categories/TaskCategoriesPageClient"
import { fetchTaskCategories } from "@/lib/server/matdev-tags"

const TaskCategoriesPage = async () => {
    const { categories, error } = await fetchTaskCategories()
    return <TaskCategoriesPageClient initialCategories={categories} loadError={error} />
}

export default TaskCategoriesPage
