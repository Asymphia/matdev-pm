import UsersPageClient from "@/components/users/UsersPageClient"
import { fetchMatdevUsers } from "@/lib/server/matdev-users"

const UsersPage = async () => {
    const { users, error } = await fetchMatdevUsers()
    return <UsersPageClient initialUsers={users} loadError={error} />
}

export default UsersPage
