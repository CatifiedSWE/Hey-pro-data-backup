"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RecommendationUser, recommendationUsers } from "@/data/recommendUsers";
import { MapPin, Search } from "lucide-react";
import Image from "next/image";

export function SeeAllReferralsDialog() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return recommendationUsers;
    }

    return recommendationUsers.filter((user) => {
      return (
        user.name.toLowerCase().includes(query) ||
        user.handle.toLowerCase().includes(query)
      );
    });
  }, [searchTerm]);

  const groupedUsers = useMemo(() => {
    return filteredUsers.reduce<Record<string, RecommendationUser[]>>(
      (acc, user) => {
        if (!acc[user.category]) {
          acc[user.category] = [];
        }
        acc[user.category].push(user);
        return acc;
      },
      {},
    );
  }, [filteredUsers]);

  return (
    <Dialog>
      <div>
        <DialogTrigger asChild>
          <Button className="bg-[#fbfbfb] text-[#FA6E80] rounded-[10px] ">
            See referrals
          </Button>
        </DialogTrigger>
        <DialogContent className=" rounded-[28px] px-10 ">
          <div className="space-y-6 p-2 mt-10">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-2xl font-semibold text-[#1D1D1F]">
                Referred people for your Gig
              </DialogTitle>
            </DialogHeader>

            <div className="">
              <div className="relative">
                <Input
                  id="user-search"
                  placeholder="Search people who all are recommended"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="h-12 rounded-full border border-[#F7C7D2] bg-white pl-5 pr-16 text-sm text-[#515151] focus-visible:ring-0"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#FF5470] text-white shadow-md"
                  aria-label="search"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div></div>

            <ScrollArea className="max-h-[460px]">
              {filteredUsers.length === 0 ? (
                <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-muted-foreground">
                  No users match your search.
                </p>
              ) : (
                <div className="space-y-8 p-6">
                  {Object.entries(groupedUsers).map(([category, users]) => (
                    <section key={category} className="space-y-3">
                      <p className="text-sm font-semibold text-[#E05082]">
                        {category}
                      </p>
                      <div className="rounded-[22px] divide-y divide-[#F4F4F4]">
                        {users.map((user) => (
                          <div
                            key={user.id}
                            className="flex flex-wrap items-center gap-4 py-4"
                          >
                            <div className="flex flex-1 items-center gap-3 min-w-[220px]">
                              <Image
                                src={user.avatar}
                                alt={user.name}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-base font-semibold text-[#1D1D1F]">
                                  {user.name}
                                </p>
                                <div className="flex items-center gap-1 text-sm text-[#6F6F6F]">
                                  <MapPin className="h-4 w-4 text-[#8F8F8F]" />
                                  <span>{user.location}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center -space-x-3">
                                {user.mutualAvatars.map((avatar, index) => (
                                  <Image
                                    key={`${user.id}-mutual-${index}`}
                                    src={avatar}
                                    alt="mutual connection"
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 rounded-full border-2 border-white object-cover"
                                  />
                                ))}
                                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#15B5B0] text-xs font-bold text-white">
                                  {user.mutualCount}
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              className="h-[44px] rounded-2xl bg-[#2AA9A7] px-5 text-sm font-semibold capitalize text-white shadow-md hover:bg-[#249694]"
                            >
                              Send Invite
                            </Button>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}
