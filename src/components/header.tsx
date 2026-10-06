import { IconLogout } from "@tabler/icons-react";

import { logout } from "@/actions/auth";
import type { SessionUser } from "@/lib/session";

import { Logo } from "./logo";
import { Avatar } from "./ui/avatar";
import { UploadDialog } from "./upload-dialog";

export function Header({ user }: { user: SessionUser }) {
  return (
    <header className="surface-glass sticky top-0 z-40 border-b">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Logo />
        <div className="flex items-center gap-1 sm:gap-3">
          <UploadDialog />
          <div className="hidden items-center gap-2.5 pl-2 sm:flex">
            <Avatar name={user.name} />
            <span className="max-w-40 truncate text-sm font-medium">{user.name}</span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="grid size-11 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <IconLogout size={20} aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
