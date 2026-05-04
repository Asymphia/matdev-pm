import type { UserType } from "@/lib/data"

export type ApiGetUserDTO = {
    userId: number
    firstName: string
    lastName: string
    email?: string | null
    phoneNumber?: string | null
}

export function mapApiUserToUserType(u: ApiGetUserDTO): UserType {
    return {
        id: u.userId,
        firstName: u.firstName ?? "",
        secondName: u.lastName ?? "",
        email: u.email ?? "",
        phone: u.phoneNumber ?? "",
    }
}
