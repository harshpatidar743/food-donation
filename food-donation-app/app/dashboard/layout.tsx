import type { ReactNode } from "react";
import AdminRoute from "../components/AdminRoute";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminRoute>{children}</AdminRoute>;
}
