import PageTransition from "@/components/ui/page-transition";

export default function PortalTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
