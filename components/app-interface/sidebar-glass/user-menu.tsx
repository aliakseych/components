"use client";

import { CheckIcon, LogOutIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || "?";

export type UserAvatarProps = {
  name: string;
  imageUrl?: string | null;
  /** Second line, such as a login or role. Shown with `showInfo`. */
  subtitle?: string | null;
  showInfo?: boolean;
  className?: string;
};

export const UserAvatar = ({
  name,
  imageUrl,
  subtitle,
  showInfo = false,
  className,
}: UserAvatarProps) => (
  <span className="flex min-w-0 items-center gap-2">
    <Avatar className={cn("size-8", className)}>
      {imageUrl ? <AvatarImage alt="" src={imageUrl} /> : null}
      <AvatarFallback className="rounded-full text-xs">{initials(name)}</AvatarFallback>
    </Avatar>
    {showInfo ? (
      <span className="grid min-w-0 flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{name}</span>
        {subtitle ? (
          <span className="truncate text-muted-foreground text-xs">{subtitle}</span>
        ) : null}
      </span>
    ) : null}
  </span>
);

export type UserMenuItem = {
  key: string;
  title: string;
  icon?: ComponentType<{ className?: string }>;
  href?: string;
  onSelect?: () => void;
};

/** Another app of the same family the user can switch to. */
export type UserMenuPlatform = {
  key: string;
  name: string;
  description: string;
  href: string;
  current?: boolean;
};

/** A radio group in the menu, such as the language or theme. */
export type UserMenuChoice = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

export type UserMenuProps = {
  name: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  items?: UserMenuItem[];
  platforms?: UserMenuPlatform[];
  platformsLabel?: string;
  /** Extra radio groups, such as language and theme. */
  choices?: UserMenuChoice[];
  onLogout: () => void;
  logoutLabel?: string;
  menuLabel?: string;
  /** `avatar` is a round button for a top bar. `row` fills the sidebar footer and opens upwards. */
  variant?: "avatar" | "row";
  renderLink?: (props: { href: string; className?: string; children: ReactNode }) => ReactNode;
};

const ROW_CLASS =
  "flex h-auto min-h-11 w-full items-center justify-start rounded-full px-2 py-1.5 text-left outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring md:min-h-10 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0";
const AVATAR_CLASS =
  "flex size-11 items-center justify-center rounded-full outline-none ring-1 ring-border hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring md:size-9";

/** The profile menu from ihsp-web: who is signed in, app links, choices such as language and theme, and log out. */
export const UserMenu = ({
  name,
  subtitle,
  imageUrl,
  items = [],
  platforms = [],
  platformsLabel = "Your apps",
  choices = [],
  onLogout,
  logoutLabel = "Log out",
  menuLabel = "Account menu",
  variant = "avatar",
  renderLink = (props) => <a {...props} />,
}: UserMenuProps) => {
  const row = variant === "row";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={menuLabel}
          className={row ? ROW_CLASS : AVATAR_CLASS}
          type="button"
        >
          <UserAvatar imageUrl={imageUrl} name={name} showInfo={row} subtitle={subtitle} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={row ? "start" : "end"}
        className="w-64"
        side={row ? "top" : "bottom"}
        sideOffset={10}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="px-1 py-1.5">
            <UserAvatar imageUrl={imageUrl} name={name} showInfo subtitle={subtitle} />
          </div>
        </DropdownMenuLabel>
        {items.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {items.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    {Icon && <Icon aria-hidden="true" className="size-4" />}
                    {item.title}
                  </>
                );
                return (
                  <DropdownMenuItem
                    asChild={Boolean(item.href)}
                    className="min-h-11 md:min-h-8"
                    key={item.key}
                    onClick={item.onSelect}
                  >
                    {item.href ? renderLink({ href: item.href, children: content }) : content}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </>
        )}
        {platforms.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>{platformsLabel}</DropdownMenuLabel>
              {platforms.map((platform) => (
                <DropdownMenuItem asChild className="min-h-11 md:min-h-9" key={platform.key}>
                  <a aria-current={platform.current ? "page" : undefined} href={platform.href}>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-medium">{platform.name}</span>
                      <span className="truncate text-muted-foreground text-xs">
                        {platform.description}
                      </span>
                    </span>
                    {platform.current && <CheckIcon aria-label="Current app" className="size-4" />}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
        {choices.map((choice) => (
          <DropdownMenuGroup key={choice.label}>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{choice.label}</DropdownMenuLabel>
            <DropdownMenuRadioGroup onValueChange={choice.onChange} value={choice.value}>
              {choice.options.map((option) => (
                <DropdownMenuRadioItem
                  className="min-h-11 md:min-h-8"
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="min-h-11 md:min-h-8" onClick={onLogout}>
          <LogOutIcon aria-hidden="true" className="size-4" />
          {logoutLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
