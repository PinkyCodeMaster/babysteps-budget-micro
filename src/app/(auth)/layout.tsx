import { GalleryVerticalEnd } from "lucide-react"
import React from "react"
import Link from "next/link"
import Image from "next/image"

export default function AuthLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        Baby Steps.
                    </Link>
                </div>
               {children}
            </div>
            <div className="bg-muted relative hidden lg:block">
                <Image
                    src="https://images.unsplash.com/photo-1591033594798-33227a05780d?q=80&w=1518&auto=format&fit=crop"
                    alt="credit to:https://unsplash.com/@snowjam"
                    fill
                    priority
                    sizes="(min-width:1024px) 50vw, 100vw"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </div>
        </div>
    )
}
