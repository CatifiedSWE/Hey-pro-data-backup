import { Search } from "lucide-react"
import Link from "next/link"

const Header = () => {
    return (
        <div className="mt-0 space-y-4 px-2 sm:px-0 max-w-6xl w-full">
            <div className="flex flex-row justify-between gap-3 w-full">
                <span className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-3xl font-semibold">
                    Collab
                </span>
                <Link
                    href="/collab/manage-collab"
                    className="inline-flex w-[192px] h-[44px] items-center justify-center rounded-[12px] border border-transparent bg-[#31A7AC] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
                >
                    Manage Collab
                </Link>
            </div>
            <SearchBar />
        </div>
    )
}

const ManageCollabHeader = () => {
    return (
        <div className="mt-0 space-y-4 px-2 sm:px-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-3xl font-semibold">
                    Manage Collab
                </span>

            </div>
            {/* <SearchBar /> */}
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
