import PocketBase from "pocketbase";
import { env } from "$env/dynamic/private";

let adminClient: PocketBase | null = null;

function getPocketBaseUrl(): string {
    const url =
        env.POCKETBASE_URL ||
        env.PB_URL ||
        env.PRIVATE_POCKETBASE_URL ||
        env.PRIVATE_PB_URL ||
        "http://127.0.0.1:8090";

    return url.replace(/\/+$/, "");
}

async function authenticateAdmin(pb: PocketBase): Promise<void> {
    const email =
        env.POCKETBASE_ADMIN_EMAIL ||
        env.PB_ADMIN_EMAIL ||
        env.PRIVATE_POCKETBASE_ADMIN_EMAIL ||
        env.PRIVATE_PB_ADMIN_EMAIL;

    const password =
        env.POCKETBASE_ADMIN_PASSWORD ||
        env.PB_ADMIN_PASSWORD ||
        env.PRIVATE_POCKETBASE_ADMIN_PASSWORD ||
        env.PRIVATE_PB_ADMIN_PASSWORD;

    if (!email || !password) {
        throw new Error(
            "Missing PocketBase admin credentials. Set POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD in Vercel Environment Variables."
        );
    }

    if (!pb.authStore.isValid) {
        await pb.admins.authWithPassword(email, password);
    }
}

export async function getPbAdmin(): Promise<PocketBase> {
    if (!adminClient) {
        adminClient = new PocketBase(getPocketBaseUrl());
        adminClient.autoCancellation(false);
    }

    await authenticateAdmin(adminClient);

    return adminClient;
}
