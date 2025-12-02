import { Search } from "lucide-react"
import Link from "next/link"

const Header = () => {
    return (
        <div className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-[1200px] mx-auto px-4 py-4">
                <div className="flex flex-row justify-between items-center gap-3 w-full">
                    <span className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-3xl font-bold">
                        Collab
                    </span>
                    <Link
                        href="/collab/manage-collab"
                        className="inline-flex items-center justify-center rounded-xl bg-[#31A7AC] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#289398] shadow-sm"
                    >
                        Manage Collabs
                    </Link>
                </div>
            </div>
        </div>
    )
}

const ManageCollabHeader = () => {
    return (
        <div className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-[1200px] mx-auto px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-3xl font-bold">
                        Manage Collab
                    </span>
                    <Link
                        href="/collab"
                        className="inline-flex items-center justify-center rounded-xl bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 shadow-sm"
                    >
                        ← Back to Collabs
                    </Link>
                </div>
            </div>
        </div>
    )
}

import { Search } from "lucide-react"
import Link from "next/link"

const Header = () => {
    return (
        <div className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-[1200px] mx-auto px-4 py-4">
                <div className="flex flex-row justify-between items-center gap-3 w-full">
                    <span className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-3xl font-bold">
                        Collab
                    </span>
                    <Link
                        href="/collab/manage-collab"
                        className="inline-flex items-center justify-center rounded-xl bg-[#31A7AC] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#289398] shadow-sm"
                    >
                        Manage Collabs
                    </Link>
                </div>
            </div>
        </div>
    )
}

const ManageCollabHeader = () => {
    return (
        <div className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-[1200px] mx-auto px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-3xl font-bold">
                        Manage Collab
                    </span>
                    <Link
                        href="/collab"
                        className="inline-flex items-center justify-center rounded-xl bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 shadow-sm"
                    >
                        ← Back to Collabs
                    </Link>
                </div>
            </div>
        </div>
    )
}

export { Header, ManageCollabHeader }
