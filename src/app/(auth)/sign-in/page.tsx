import { LoginForm } from '@/components/auth/login-form'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function SignInPage() {

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (session) {
        redirect("/dashboard")
    }

    return (
        <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
                <LoginForm />
            </div>
        </div>
    )
}
