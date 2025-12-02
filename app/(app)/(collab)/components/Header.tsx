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

const SearchBar = () => (
    <div className="mx-auto w-full max-w-full sm:px-0">
        <div className="flex w-full max-w-[773px]  items-center justify-between gap-3 rounded-full border border-[#FA6E80] px-4 py-2 text-sm shadow-sm sm:mx-auto">
            <input
                placeholder="Search by name, role, or department..."
                className=" border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FA6E80]">
                <Search className="h-5 w-5 text-white" />
            </span>
        </div>
    </div>
)

export { Header, ManageCollabHeader }
