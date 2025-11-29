"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  X,
  Bell,
  Briefcase,
  MessageCircleMore,
  Compass,
  Calendar,
  NewspaperIcon,
  SatelliteDishIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Logo from "../logo"
const notifications = [
  {
    id: 1,
    title: "New job match",
    description: "Senior Frontend Developer at TechCorp matches your profile",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    title: "Event reminder",
    description: "Tech Networking Meetup starts tomorrow at 6 PM",
    time: "5 hours ago",
    read: false,
  },
  {
    id: 3,
    title: "Application update",
    description: "Your application for Product Manager role is under review",
    time: "1 day ago",
    read: true,
  },
  {
    id: 4,
    title: "New message",
    description: "Sarah from HR team sent you a message",
    time: "2 days ago",
    read: true,
  },
  {
    id: 5,
    title: "Profile view",
    description: "5 recruiters viewed your profile this week",
    time: "3 days ago",
    read: true,
  },
]
const components: { title: string; href: string; category: string }[] = [
  // Pre Production
  { title: "Casting", href: "/explore/casting", category: "Pre Production" },
  { title: "Camera Operator", href: "/explore/camera-operator", category: "Pre Production" },
  { title: "Cinematographer", href: "/explore/cinematographer", category: "Pre Production" },
  { title: "Director", href: "/explore/director", category: "Pre Production" },
  { title: "Location Manager", href: "/explore/location manager", category: "Pre Production" },
  { title: "Screenwriter", href: "/explore/screenwriter", category: "Pre Production" },

  // Post Production
  { title: "Animator", href: "/explore/animator", category: "Post Production" },
  { title: "Editor", href: "/explore/editor", category: "Post Production" },
  { title: "Sound Technician", href: "/explore/sound-technician", category: "Post Production" },
  { title: "VFX / SFX", href: "/explore/vfx-sfx", category: "Post Production" },


  // Craft Services
  { title: "Hairstylist", href: "/explore/hairstylist", category: "Craft Services" },
  { title: "Makeup Artist", href: "/explore/makeup-artist", category: "Craft Services" },
  { title: "Set Designer", href: "/explore/set-designer", category: "Craft Services" },

]

interface NavigationMenuItem {
  title: string;
  href: string;
}
const navigationMenuItems: NavigationMenuItem[] = [
  { title: "Gigs", href: "/gigs" },
  { title: "What’s on", href: "/whats-on" },
  { title: "Collab", href: "/collab" },
]
export default function Header() {
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      <nav className="fixed top-0  h-[80px] z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 max-w-[1080px]">
          <div className="flex h-18 items-center justify-between gap-8">
            {/* Logo */}
            <Link href="/" className="w-[55.50847625732422px] h-[50px] flex items-center">
              <Logo />
            </Link>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Input
                  type="search"
                  placeholder="Search jobs, events..."
                  className="w-full h-[48px] max-w-[270px] rounded-full pr-10 text-base bg-secondary/80 border-none focus-visible:ring-accent"
                />
                <div className="absolute left-[230px] top-1/2 h-[34px] w-[34px] -translate-y-1/2 bg-[#FA6E80] hover:bg-[#f95569] text-white rounded-full flex items-center justify-center">
                  <Search className="h-[18px] w-[18px]" />
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <NavigationMenu>
                <NavigationMenuList className="flex-wrap">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger><Link href="/explore">Explore</Link></NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid grid-cols-3 gap-4 w-[748px]">
                        {["Pre Production", "Post Production", "Craft Services"].map(
                          (category, idx, arr) => {
                            const items = components.filter(c => c.category === category)
                            return (
                              <div key={category} className="flex">
                                <div className="flex-1">
                                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide">
                                    {category}
                                  </h3>
                                  <div className="space-y-1">
                                    {items.length > 0 ? (
                                      items.map(component => (
                                        <ListItem
                                          key={component.title}
                                          title={component.title}
                                          href={component.href}
                                        />
                                      ))
                                    ) : (
                                      <p className="text-xs text-muted-foreground italic">
                                        Coming soon
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {idx < arr.length - 1 && (
                                  <Separator orientation="vertical" className="mx-4 h-auto hidden lg:block" />
                                )}
                              </div>
                            )
                          }
                        )}
                      </ul>
                      <div className=" text-sm flex flex-row justify-center items-center mx-auto gap-3.5">
                        <p>Discover on more field, jobs, events, etc,. </p> <Link href={"#"} className="text-[#31A7AC] font-[400]"> See More</Link>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <div>
                      {navigationMenuItems.map((item) => (
                        <NavigationMenuLink
                          key={item.title}
                          asChild
                          className={navigationMenuTriggerStyle()}
                        >
                          <Link href={item.href}>{item.title}</Link>
                        </NavigationMenuLink>
                      ))}
                    </div>

                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] text-white hover:text-white px-4 py-2 rounded-full"
                    >
                      <Link href="/slate">Slate</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                </NavigationMenuList>
              </NavigationMenu>



            </div>

            <div className="flex items-center gap-4">
              <div
                className="relative"
                onMouseLeave={() => setChatOpen(false)}
              >
                <Link href="/inbox"

                  className="relative cursor-pointer"
                >
                  <MessageCircleMore className="h-9 w-9" />
                  <Badge className="absolute top-6 right-1 h-3 w-3 rounded-full p-0 flex items-center justify-center text-xs bg-[#FA596E] text-white">

                  </Badge>
                </Link>


              </div>

              <div
                className="relative hidden md:block"
                onMouseLeave={() => setNotificationOpen(false)}
              >
                <div
                  onMouseEnter={() => setNotificationOpen(true)}
                  onClick={() => setNotificationOpen((prev) => !prev)}
                  aria-label="Notifications"
                  className="relative h-9 w-9 cursor-pointer"
                >
                  <Bell className="h-9 w-9" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-[#FA596E] text-white">
                      {unreadCount}
                    </Badge>
                  )}
                </div>

                {notificationOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNotificationOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-background border border-border rounded-lg shadow-lg z-50">
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-semibold">Notifications</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setNotificationOpen(false)}
                            aria-label="Close notifications"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                        <Separator className="mb-2" />
                        {notifications.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No notifications</p>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 rounded-lg mb-2 cursor-pointer hover:bg-secondary/50 ${!notification.read ? "bg-accent/10" : ""
                                }`}
                            >
                              <h4 className="font-medium">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground">{notification.description}</p>
                              <span className="text-xs text-muted-foreground">{notification.time}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div
                className="relative"
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <div
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  onMouseEnter={() => setUserMenuOpen(true)}
                  className="cursor-pointer"
                >
                  <Avatar className="h-[50px] w-[50px] rounded-full border-[#000000] border-[2px]">
                    <AvatarImage src="/image (2).png" alt="User" />
                    <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
                  </Avatar>
                </div>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-0 w-[199px] h-[358px]  bg-background border border-border rounded-[15px] shadow-lg z-50 p-4">
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setUserMenuOpen(false)}
                          aria-label="Close user menu"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex flex-col items-center  ">
                        <div className="relative -mt-3 ">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src="/image (2).png" alt="User" />
                            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">JD</AvatarFallback>
                          </Avatar>
                          <span className="absolute bottom-1 right-10 block h-[10px] w-[10px] border-[1px] rounded-full bg-[#34A353] ring-2 ring-background" />
                        </div>
                        <p className="font-[500] text-lg">John Doe</p>
                      </div>
                      <div className="-space-y-5">
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base" asChild>
                          <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="">
                            <span className="font-[400]">
                              Profile
                            </span>

                          </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base" asChild>
                          <Link href="/profile/saved" onClick={() => setUserMenuOpen(false)}>
                            <span className="font-[400]">
                              Saved
                            </span>
                          </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base" asChild>
                          <Link href="/help" onClick={() => setUserMenuOpen(false)}>
                            <span className="font-[400]">
                              Help
                            </span>
                          </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base" asChild>
                          <Link href="/settings" onClick={() => setUserMenuOpen(false)}>
                            <span className="font-[400]">
                              Settings
                            </span>
                          </Link>
                        </Button>
                        <Separator className="mt-2 mb-0" />
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 h-12 text-base"
                          onClick={() => {
                            setUserMenuOpen(false)
                          }}
                        >
                          <span className="font-[400]">
                            Sign Out
                          </span>


                        </Button>
                      </div>
                      <div className="group relative flex w-[141px] h-[41px] items-center mx-auto justify-center overflow-hidden rounded-[10px] p-[1px]">
                        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]" />
                        <Button className="relative flex h-full w-full items-center justify-center gap-3 rounded-[inherit] bg-white text-transparent shadow-none hover:bg-gray-50 dark:bg-slate-950 dark:hover:bg-slate-900">
                          <span className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent">
                            Send Invite
                          </span>

                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>


          </div>
        </div>
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-around px-6 py-3">
          <Link
            href="/explore"
            className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setChatOpen(false)
              setNotificationOpen(false)
              setUserMenuOpen(false)
            }}
          >
            <Compass className="h-6 w-6" />
          </Link>

          <Link
            href="/gigs"
            className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setChatOpen(false)
              setNotificationOpen(false)
              setUserMenuOpen(false)
            }}
          >
            <Briefcase className="h-6 w-6" />
          </Link>
          <Link
            href="/collab"
            className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setChatOpen(false)
              setNotificationOpen(false)
              setUserMenuOpen(false)
            }}
          >
            <Calendar className="h-6 w-6" />
          </Link>
          <Link
            href="/whats-on"
            className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setChatOpen(false)
              setNotificationOpen(false)
              setUserMenuOpen(false)
            }}
          >
            <NewspaperIcon className="h-6 w-6" />
          </Link>
          <Link
            href="/slate"
            className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setChatOpen(false)
              setNotificationOpen(false)
              setUserMenuOpen(false)
            }}
          >
            <SatelliteDishIcon className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </>
  )
}



function ListItem({
  title,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}